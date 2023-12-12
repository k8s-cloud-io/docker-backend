<?php

namespace App\Event;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class ContentSubscriber implements EventSubscriberInterface
{
    public function onKernelResponse(ResponseEvent $event): void
    {
        $event->getResponse()->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $event->getResponse()->headers->remove('x-powered-by');

        $request = $event->getRequest();
        if (!$request->isXmlHttpRequest()) {
            $event->getResponse()->headers->set('X-Robots-Tag', 'index');
            $event->getResponse()->headers->set('Content-Security-Policy', "style-src 'self' 'unsafe-inline'; default-src 'self'; img-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'");
            $event->getResponse()->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $event->getResponse()->headers->set('X-XSS-Protection', '1');
        }
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();
        if ($request->isXmlHttpRequest() || 'json' === $request->getContentType() || 0 === strpos($request->getPathInfo(), '/api')) {
            $ex = $event->getThrowable();
            $ref = new \ReflectionClass(get_class($ex));
            $code = 500;

            if ($ref->hasMethod('getStatusCode')) {
                $method = $ref->getMethod('getStatusCode');
                $code = $method->invoke($ex);
            }

            $response = new JsonResponse([
                'error' => $ex->getMessage(),
                'code' => $code,
            ], $code);

            $event->setResponse($response);
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
            KernelEvents::EXCEPTION => 'onKernelException',
        ];
    }
}
