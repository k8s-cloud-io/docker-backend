<?php

namespace App\GraphQL\Exception;

use GraphQL\Error\ClientAware;
use GraphQL\Error\Error;

class ResolverNotFoundException extends Error implements ClientAware
{
    public function isClientSafe(): bool
    {
        return true;
    }
}
