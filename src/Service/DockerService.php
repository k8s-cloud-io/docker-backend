<?php

namespace App\Service;

use App\Lib\DockerResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DockerService
{
    private string $socketPath;

    public function __construct(string $socketPath)
    {
        if (!file_exists($socketPath)) {
            throw new \RuntimeException("Unable to communicate with socket path $socketPath: files does not exists");
        }

        if (!is_readable($socketPath)) {
            throw new \RuntimeException("Unable to read from socket path $socketPath");
        }

        if (!is_writeable($socketPath)) {
            throw new \RuntimeException("Unable to write to socket path $socketPath");
        }

        $this->socketPath = $socketPath;
    }

    public function get(string $url): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_GET,
        ]);
    }

    public function post(string $url, mixed $data = null): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_POST,
            'data' => $data,
        ]);
    }

    public function put(string $url, mixed $data = null): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_PUT,
            'data' => $data,
        ]);
    }

    public function patch(string $url, mixed $data = null): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_PATCH,
            'data' => $data,
        ]);
    }

    public function delete(string $url): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_DELETE,
        ]);
    }

    public function head(string $url): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_HEAD,
        ]);
    }

    public function options(string $url): DockerResponse
    {
        return $this->request([
            'url' => $url,
            'method' => Request::METHOD_OPTIONS,
        ]);
    }

    protected function request(array $options): DockerResponse
    {
        if (empty($options['url'])) {
            throw new \InvalidArgumentException('url must not be empty');
        }

        $url = $options['url'];
        if (!str_starts_with($url, 'http://')) {
            $url = 'http://localhost'.$url;
        }

        $headers = [
            'Host: localhost',
        ];

        $httpMethods = [
            Request::METHOD_GET,
            Request::METHOD_POST,
            Request::METHOD_PUT,
            Request::METHOD_DELETE,
            Request::METHOD_PATCH,
            Request::METHOD_HEAD,
            Request::METHOD_OPTIONS,
        ];

        $method = Request::METHOD_GET;
        if (!empty($options['method'])) {
            if (!is_string($options['method'])) {
                throw new \InvalidArgumentException('invalid HTTP method: must be a string');
            }

            $method = strtoupper($options['method']);
            if (!in_array($method, $httpMethods)) {
                throw new \InvalidArgumentException('invalid or missing HTTP method');
            }
        }

        $handle = curl_init();
        curl_setopt($handle, CURLOPT_URL, $url);
        curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($handle, CURLOPT_TCP_FASTOPEN, true);
        curl_setopt($handle, CURLOPT_UNIX_SOCKET_PATH, $this->socketPath);
        curl_setopt($handle, CURLOPT_HEADER, false);
        curl_setopt($handle, CURLOPT_CUSTOMREQUEST, $method);

        $data = $options['data'] ?? null;

        if (Request::METHOD_POST === $method) {
            $json = json_encode($data);
            curl_setopt($handle, CURLOPT_POSTFIELDS, $json);
            $headers[] = 'Content-Type: application/json';
            $headers[] = 'Content-Length: '.strlen($json);
        }

        if (!empty($options['headers'])) {
            if (!is_array($options['headers'])) {
                throw new \InvalidArgumentException('headers must be of type array');
            }

            $headers = array_merge($headers, $options['headers']);
        }
        curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);

        $responseContent = curl_exec($handle);
        $responseCode = curl_getinfo($handle, CURLINFO_HTTP_CODE);

        if (curl_errno($handle)) {
            $error = curl_error($handle);
            if (empty($error)) {
                $error = 'Unknown error';
            }

            curl_close($handle);
            throw new \RuntimeException($error, $responseCode ?? 500);
        }
        curl_close($handle);

        if ($responseCode >= 400) {
            $message = JsonResponse::$statusTexts[$responseCode];
            if (!empty($responseContent) && !empty(json_decode($responseContent)->message)) {
                $message = json_decode($responseContent)->message;
            }

            throw new HttpException($responseCode, $message);
        }

        if (str_contains($options['url'], '/logs')) {
            $responseContent = preg_replace("/[\r\n]+/", "\n", $responseContent);
            $lines = explode("\n", $responseContent);
            $filtered = [];
            foreach ($lines as $line) {
                if (empty($line)) {
                    break;
                }

                $l = substr($line, 8, strlen($line) - 8);
                $filtered[] = json_decode($l, true, 2147483646, JSON_OBJECT_AS_ARRAY);
            }

            $responseContent = json_encode($filtered);
        }

        $response = new DockerResponse();
        $response->setStatusCode($responseCode);
        $response->setContent($responseContent);

        return $response;
    }
}
