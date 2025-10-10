<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class HealthController extends AbstractController
{
    public function health(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'environment' => $_ENV['APP_ENV'] ?? 'unknown',
            'services' => [
                'database' => $this->checkDatabase(),
                'filesystem' => $this->checkFilesystem()
            ]
        ]);
    }

    private function checkDatabase(): string
    {
        try {
            // Sprawdzenie połączenia z bazą danych
            // W rzeczywistej aplikacji można by użyć Doctrine
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }

    private function checkFilesystem(): string
    {
        try {
            $testFile = sys_get_temp_dir() . '/health_check.tmp';
            file_put_contents($testFile, 'test');
            unlink($testFile);
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }
}
