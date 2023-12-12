<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Yaml\Yaml;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;
use Twig\TemplateWrapper;

class TwigService
{
    public static function getEnvironment(Container $container): Environment
    {
        return new class($container) extends Environment {
            private $container;
            private $rootPath;

            private $loader;

            public function __construct(Container $container)
            {
                $this->container = $container;
                $this->loader = new FilesystemLoader();
                $this->rootPath = $container->getParameter('kernel.project_dir');
                $config = Yaml::parseFile($this->rootPath.DIRECTORY_SEPARATOR.implode(DIRECTORY_SEPARATOR, ['config', 'packages', 'twig.yaml']), Yaml::PARSE_OBJECT_FOR_MAP);

                $options = [];

                if (isset($config->twig->cache)) {
                    $options['cache'] = $config->twig->cache;
                }
                if (isset($config->twig->debug)) {
                    $options['debug'] = $config->twig->debug;
                }
                if (isset($config->twig->charset)) {
                    $options['charset'] = $config->twig->charset;
                }
                if (isset($config->twig->strict_variables)) {
                    $options['strict_variables'] = $config->twig->strict_variables;
                }
                if (isset($config->twig->auto_reload)) {
                    $options['auto_reload'] = $config->twig->auto_reload;
                }
                if (isset($config->twig->optimizations)) {
                    $options['auto_reload'] = $config->twig->optimizations;
                }

                if (isset($config->twig->default_path)) {
                    $path = $config->twig->default_path;
                    $this->addPath($path);
                }

                if (isset($config->twig->paths)) {
                    $path_keys = array_keys(get_object_vars($config->twig->paths));
                    if (count($path_keys)) {
                        foreach ($path_keys as $path) {
                            if (is_string($config->twig->paths->{$path})) {
                                $namespace = $config->twig->paths->{$path};
                                $this->addPath($path, $namespace);
                            }
                        }
                    }
                }

                parent::__construct($this->loader, $options);
            }

            public function load($name): TemplateWrapper
            {
                if (!empty($name)) {
                    $info = pathinfo($name, PATHINFO_EXTENSION);
                    if (empty($info)) {
                        $name .= '.html.twig';
                    }
                }

                return parent::load($name);
            }

            private function resolveContainerParameter($variable): array
            {
                $regex = '/%.*?%/';
                $matches = [];

                preg_match($regex, $variable, $matches);

                return $matches;
            }

            private function addPath($path, $namespace = FilesystemLoader::MAIN_NAMESPACE)
            {
                if (strstr($path, '%')) {
                    $params = $this->resolveContainerParameter($path);
                    foreach ($params as $index => $placeHolder) {
                        $paramName = str_replace('%', '', $placeHolder);
                        $param = $this->container->getParameter($paramName);
                        $path = str_replace($placeHolder, $param, $path);
                    }
                }

                if (0 !== strpos($path, DIRECTORY_SEPARATOR)) {
                    $path = $this->rootPath.DIRECTORY_SEPARATOR.$path;
                }
                $this->loader->addPath($path, $namespace);
            }
        };
    }
}
