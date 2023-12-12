<?php

namespace App\Service;

use App\GraphQL\Exception\ResolverNotFoundException;
use GraphQL\Error\DebugFlag;
use GraphQL\Error\Error;
use GraphQL\Error\FormattedError;
use GraphQL\Error\SyntaxError;
use GraphQL\GraphQL;
use GraphQL\Type\Schema;
use GraphQL\Utils\BuildSchema;
use phpDocumentor\Reflection\DocBlockFactory;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class GraphQLService
{
    private static GraphQLService $instance;
    private array $resolvers = [];
    private Schema $schema;

    private bool $debug;

    /**
     * @throws SyntaxError
     * @throws \ReflectionException
     * @throws Error
     */
    public static function getInstance(ContainerInterface $container): GraphQLService
    {
        if (empty(self::$instance)) {
            self::$instance = new self();

            self::$instance->debug = $container->getParameter('kernel.debug');
            $contents = file_get_contents($container->getParameter('graphql.schema'));
            self::$instance->schema = BuildSchema::build($contents);
            self::$instance->registerResolvers($container);
        }

        return self::$instance;
    }

    public function handleRequest(Request $request): JsonResponse
    {
        $content = $request->getContent();
        $query = null;
        $variables = null;
        $operationName = null;
        if (!empty($content)) {
            $content = json_decode($content, JSON_OBJECT_AS_ARRAY);
            $query = $content['query'] ?? null;
            $variables = $content['variables'] ?? [];
            $operationName = $content['operationName'] ?? null;
        }

        try {
            $query = !empty($query) ? trim($query) : null;

            if (empty($query)) {
                throw new \InvalidArgumentException('Unable to handle GraphQL request: empty query', 400);
            }

            $queryParts = explode(' ', $query);
            if ('query' !== $queryParts[0] && 'mutation' !== $queryParts[0]) {
                throw new \InvalidArgumentException('Unable to handle GraphQL request: invalid query parameter', 400);
            }

            $resolverName = trim($operationName);
            if (!isset($this->resolvers[$resolverName])) {
                throw new ResolverNotFoundException("No resolver found for '$resolverName'", 500);
            }

            $debug = $this->debug ? DebugFlag::INCLUDE_DEBUG_MESSAGE : DebugFlag::NONE;
            $result = GraphQL::executeQuery(
                // configured graphql schema
                $this->schema,
                // query / mutation sent
                $query,
                // supported query/mutation responses
                $this->resolvers,
                // custom context
                null,
                // variables sent
                $variables,
                // operationName sent,
                $operationName,
                // custom field resolver
                null,
                // validation rules
                null
            )->toArray($debug);

            return new JsonResponse($result);
        } catch (\Exception $e) {
            $errors = [FormattedError::createFromException($e)];
            $errors[0]['extensions'] = [
                'debugMessage' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];

            return new JsonResponse([
                'data' => [
                    $operationName => null,
                ],
                'errors' => $errors,
            ], 200);
        }
    }

    /**
     * @throws \ReflectionException
     */
    private function registerResolvers($container): void
    {
        $resolversList = $container->getparameter('graphql.resolvers');
        if (!is_array($resolversList)) {
            throw new \InvalidArgumentException('graphql.resolvers must be of type array');
        }

        $factory = DocBlockFactory::createInstance();
        foreach ($resolversList as $resolverConfigItem) {
            if (is_string($resolverConfigItem)) {
                if (!class_exists($resolverConfigItem)) {
                    throw new \InvalidArgumentException("Unable to register resolver class '$resolverConfigItem': class does not exists");
                }

                $ref = new \ReflectionClass($resolverConfigItem);
                $refMethods = $ref->getMethods();
                $refInstance = $ref->newInstance();
                if ($ref->implementsInterface(ContainerAwareInterface::class)) {
                    $setContainer = $ref->getMethod('setContainer');
                    $setContainer->invoke($refInstance, $container);
                }

                foreach ($refMethods as $refMethod) {
                    $doc = $refMethod->getDocComment();
                    if ($doc) {
                        $docblock = $factory->create($doc);
                        $hasResolverTag = $docblock->hasTag('graphqlResolverMethod');
                        if ($hasResolverTag) {
                            $name = $refMethod->getName();
                            $callable = [$refInstance, $name];
                            $this->resolvers[$name] = function () use ($callable) {
                                $args = func_get_args();

                                return call_user_func_array($callable, $args);
                            };
                        }
                    }
                }
            }

            if (is_array($resolverConfigItem)) {
                throw new \InvalidArgumentException('Unable to register resolver: array config is not implemented');
            }
        }
    }
}
