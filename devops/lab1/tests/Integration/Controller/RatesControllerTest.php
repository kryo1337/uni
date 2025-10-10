<?php

namespace App\Tests\Integration\Controller;

use App\Dto\CurrencyRateDto;
use App\Dto\HistoricalRateDto;
use App\Exception\CurrencyNotFoundException;
use App\Exception\UnsupportedOperationException;
use App\Service\NbpClient;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class RatesControllerTest extends WebTestCase
{
    private $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
    }

    public function testGetRateEurReturns200WithProperJson(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getSingleRateA')
            ->with('EUR', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn(new CurrencyRateDto(
                'EUR',
                4.2500,
                new \DateTimeImmutable('2025-09-19')
            ));

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/rates/EUR');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('EUR', $data['code']);
        $this->assertEquals(4.2500, $data['mid']);
        $this->assertEquals('2025-09-19', $data['effectiveDate']);
    }

    public function testGetRateInvalidCurrencyReturns404(): void
    {
        $this->client->request('GET', '/api/rates/INVALID');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('is not supported', $data['error']);
    }

    public function testGetRateNbpNotFoundReturns404(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getSingleRateA')
            ->willThrowException(new CurrencyNotFoundException('Currency EUR not found for 2025-09-19'));

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/rates/EUR');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('Currency EUR not found', $data['error']);
    }

    public function testGetHistoryReturnsArrayWith14Items(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        
        $historicalData = [];
        for ($i = 0; $i < 14; $i++) {
            $date = new \DateTimeImmutable('2025-09-19');
            $date = $date->modify("-{$i} days");
            $historicalData[] = new HistoricalRateDto(
                'EUR',
                4.2500 + ($i * 0.01),
                $date
            );
        }

        $nbpClient->method('getHistoryA')
            ->with('EUR', $this->isInstanceOf(\DateTimeInterface::class), $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn($historicalData);

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/rates/EUR/history');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('EUR', $data['code']);
        $this->assertArrayHasKey('start', $data);
        $this->assertArrayHasKey('end', $data);
        $this->assertArrayHasKey('items', $data);
        $this->assertCount(14, $data['items']);

        $firstItem = $data['items'][0];
        $this->assertArrayHasKey('effectiveDate', $firstItem);
        $this->assertArrayHasKey('mid', $firstItem);
        $this->assertIsFloat($firstItem['mid']);
    }

    public function testGetHistoryWithCustomDate(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getHistoryA')
            ->willReturn([
                new HistoricalRateDto('EUR', 4.2500, new \DateTimeImmutable('2025-09-15'))
            ]);

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/rates/EUR/history?date=2025-09-15');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('EUR', $data['code']);
        $this->assertEquals('2025-09-01', $data['start']);
        $this->assertEquals('2025-09-15', $data['end']);
    }

    public function testGetCantorQuoteEurBuyReturnsPrice(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getSingleRateA')
            ->with('EUR', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn(new CurrencyRateDto(
                'EUR',
                4.2500,
                new \DateTimeImmutable('2025-09-19')
            ));

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/cantor/quote/EUR?side=buy');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('EUR', $data['code']);
        $this->assertEquals('buy', $data['side']);
        $this->assertEquals(4.2500, $data['nbpMid']);
        $this->assertEquals(4.1000, $data['price']);
        $this->assertEquals('2025-09-19', $data['effectiveDate']);
    }

    public function testGetCantorQuoteEurSellReturnsPrice(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getSingleRateA')
            ->with('EUR', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn(new CurrencyRateDto(
                'EUR',
                4.2500,
                new \DateTimeImmutable('2025-09-19')
            ));

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/cantor/quote/EUR?side=sell');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('EUR', $data['code']);
        $this->assertEquals('sell', $data['side']);
        $this->assertEquals(4.2500, $data['nbpMid']);
        $this->assertEquals(4.3600, $data['price']);
        $this->assertEquals('2025-09-19', $data['effectiveDate']);
    }

    public function testGetCantorQuoteCzkBuyReturns400Error(): void
    {
        $this->client->request('GET', '/api/cantor/quote/CZK?side=buy');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('BUY not supported for CZK', $data['error']);
    }

    public function testGetCantorQuoteInvalidSideReturns400(): void
    {
        $this->client->request('GET', '/api/cantor/quote/EUR?side=invalid');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('Invalid trade side', $data['error']);
    }

    public function testGetCantorQuoteMissingSideReturns400(): void
    {
        $this->client->request('GET', '/api/cantor/quote/EUR');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_BAD_REQUEST, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
        $this->assertStringContainsString('side parameter is required', $data['error']);
    }

    public function testGetCantorQuoteWithCustomDate(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getSingleRateA')
            ->with('USD', $this->callback(function(\DateTimeInterface $date) {
                return $date->format('Y-m-d') === '2025-09-15';
            }))
            ->willReturn(new CurrencyRateDto(
                'USD',
                4.0000,
                new \DateTimeImmutable('2025-09-15')
            ));

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/cantor/quote/USD?side=sell&date=2025-09-15');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('USD', $data['code']);
        $this->assertEquals('sell', $data['side']);
        $this->assertEquals(4.0000, $data['nbpMid']);
        $this->assertEquals(4.1100, $data['price']);
        $this->assertEquals('2025-09-15', $data['effectiveDate']);
    }

    public function testGetRateWithCustomDate(): void
    {
        $nbpClient = $this->createMock(NbpClient::class);
        $nbpClient->method('getSingleRateA')
            ->with('USD', $this->callback(function(\DateTimeInterface $date) {
                return $date->format('Y-m-d') === '2025-09-15';
            }))
            ->willReturn(new CurrencyRateDto(
                'USD',
                4.0000,
                new \DateTimeImmutable('2025-09-15')
            ));

        $this->client->getContainer()->set('App\Service\NbpClient', $nbpClient);

        $this->client->request('GET', '/api/rates/USD?date=2025-09-15');

        $response = $this->client->getResponse();
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());

        $data = json_decode($response->getContent(), true);
        $this->assertEquals('USD', $data['code']);
        $this->assertEquals(4.0000, $data['mid']);
        $this->assertEquals('2025-09-15', $data['effectiveDate']);
    }
}
