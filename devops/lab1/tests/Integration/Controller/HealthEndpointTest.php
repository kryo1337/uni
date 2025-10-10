<?php

namespace App\Tests\Integration;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class HealthEndpointTest extends WebTestCase
{
    public function testHealthEndpointReturnsSuccessfulResponse(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/health');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertEquals('healthy', $responseData['status']);
        $this->assertArrayHasKey('timestamp', $responseData);
        $this->assertArrayHasKey('environment', $responseData);
        $this->assertArrayHasKey('services', $responseData);
    }

    public function testHealthEndpointReturnsDatabaseStatus(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/health');

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('database', $responseData['services']);
        $this->assertContains($responseData['services']['database'], ['healthy', 'unhealthy']);
    }
}
