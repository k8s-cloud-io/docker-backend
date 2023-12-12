<?php

namespace App\Controller;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class GraphqlController implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function index(Request $request): JsonResponse
    {
        $graphql = $this->container->get('graphql');

        return $graphql->handleRequest($request);
    }
}
