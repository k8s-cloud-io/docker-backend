<?php

namespace App\GraphQL\Resolvers;

use App\Lib\DeepInflector;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class DockerMutationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    /**
     * @graphqlResolverMethod
     */
    public function cleanVolumes($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/volumes/prune');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function cleanImages($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/images/prune');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function cleanContainers($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/containers/prune');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function cleanNetworks($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/networks/prune');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function removeImages($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $ids = $args['images'];
        foreach ($ids as $id) {
            $connector->delete("/images/$id");
        }

        return [];
    }

    /**
     * @graphqlResolverMethod
     */
    public function removeVolumes($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $ids = $args['volumes'];
        foreach ($ids as $id) {
            $connector->delete("/volumes/$id");
        }

        return [];
    }

    /**
     * @graphqlResolverMethod
     */
    public function updateImage($source, $args, $context, ResolveInfo $info): mixed
    {
        $data = $args['tag'];
        $parts = explode(':', $data);
        $repo = $parts[0];

        $connector = $this->container->get('docker');
        $query = http_build_query([
            'tag' => 'latest',
            'fromImage' => $repo,
        ]);
        $response = $connector->post('/images/create?'.$query);
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function restartContainer($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/containers/'.$args['id'].'/restart');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function startContainer($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/containers/'.$args['id'].'/start');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function stopContainer($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        $response = $connector->post('/containers/'.$args['id'].'/stop');
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }

    /**
     * @graphqlResolverMethod
     */
    public function removeContainers($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        foreach ($args['containers'] as $container) {
            $connector->delete('/containers/'.$container);
        }

        return [];
    }

    /**
     * @graphqlResolverMethod
     */
    public function removeNetworks($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');
        foreach ($args['networks'] as $network) {
            if (in_array($network, ['bridge', 'none', 'host'])) {
                throw new \InvalidArgumentException("Unable to delete the predefined system network '$network'");
            }
            $connector->delete('/networks/'.$network);
        }

        return [];
    }

    /**
     * @graphqlResolverMethod
     */
    public function createNetwork($source, $args, $context, ResolveInfo $info): mixed
    {
        $connector = $this->container->get('docker');

        $data = [
            'Name' => $args['name'],
            'Driver' => $args['driver'],
        ];

        if (!empty($args['subnet'])) {
            $data['IPAM'] = [
                'Config' => [
                    [
                        'Subnet' => $args['subnet'],
                    ],
                ],
            ];
        }

        $response = $connector->post('/networks/create', $data);
        $json = json_decode($response->getContent());

        return DeepInflector::camelize($json);
    }
}
