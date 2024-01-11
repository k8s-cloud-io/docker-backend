<?php

namespace App\Lib;

use Doctrine\Inflector\Inflector;
use Doctrine\Inflector\InflectorFactory;

class DeepInflector
{
    private static Inflector $inflector;

    public static function camelize(mixed $data): mixed
    {
        $keys = null;
        if (empty(self::$inflector)) {
            self::$inflector = InflectorFactory::create()->build();
        }

        if (is_object($data)) {
            $keys = array_keys(get_object_vars($data));
        } elseif (is_array($data)) {
            $keys = array_keys($data);
        }

        if (!empty($keys)) {
            foreach ($keys as $key) {
                $newKey = self::$inflector->camelize($key);

                if (is_object($data)) {
                    $value = $data->{$key};

                    if ((is_object($value) || is_array($value)) && 'Labels' !== $key) {
                        $value = DeepInflector::camelize($value);
                    }
                    $data->{$newKey} = $value;
                    if (0 !== strcmp($newKey, $key)) {
                        unset($data->{$key});
                    }
                } elseif (is_array($data)) {
                    $value = $data[$key];

                    if ((is_object($value) || is_array($value)) && 'Labels' !== $key) {
                        $value = DeepInflector::camelize($value);
                    }
                    $data[$newKey] = $value;
                    if (0 !== strcmp($newKey, $key)) {
                        unset($data[$key]);
                    }
                }
            }
        }

        return $data;
    }
}
