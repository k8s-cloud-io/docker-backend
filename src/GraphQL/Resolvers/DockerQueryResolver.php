<?php

namespace App\GraphQL\Resolvers;

use App\Lib\DeepInflector;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class DockerQueryResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    /**
     * @graphqlResolverMethod
     */
    public function images($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/images/json');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function image($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/images/'.$args['id'].'/json');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function networks($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/networks');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function network($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/networks/'.$args['id']);
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function volumes($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/volumes');
        $json = json_decode($response->getContent())->Volumes;

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function containers($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/containers/json?all=true');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function container($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/containers/'.$args['id'].'/json');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function containerLogs($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/containers/'.$args['id'].'/logs?stdout=true&stderr=true');
        $json = json_decode($response->getContent());
        if (is_array($json)) {
            $json = [...array_filter($json, function ($item) {
                return !empty($item);
            })];
        }

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function services($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->get('/services');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }
}
