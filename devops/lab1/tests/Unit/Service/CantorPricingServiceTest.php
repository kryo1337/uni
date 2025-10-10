<?php

namespace App\Tests\Unit\Service;

use App\Dto\CurrencyRateDto;
use App\Exception\UnsupportedOperationException;
use App\Service\CantorPricingService;
use App\Service\NbpClient;
use App\Value\CurrencyCode;
use App\Value\TradeSide;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class CantorPricingServiceTest extends TestCase
{
    private CantorPricingService $service;
    private MockObject $nbpClient;

    protected function setUp(): void
    {
        $this->nbpClient = $this->createMock(NbpClient::class);
        $this->service = new CantorPricingService($this->nbpClient);
    }

    public function testEurBuyCalculation(): void
    {
        $nbpRate = new CurrencyRateDto(
            'EUR',
            4.2500,
            new \DateTimeImmutable('2025-09-19')
        );

        $this->nbpClient
            ->expects($this->once())
            ->method('getSingleRateA')
            ->with('EUR', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn($nbpRate);

        $date = new \DateTime('2025-09-19');
        $quote = $this->service->quote('EUR', TradeSide::BUY, $date);

        $this->assertEquals('EUR', $quote->code);
        $this->assertEquals('buy', $quote->side);
        $this->assertEquals(4.2500, $quote->nbpMid);
        $this->assertEquals(4.1000, $quote->price);
        $this->assertEquals('2025-09-19', $quote->effectiveDate->format('Y-m-d'));
    }

    public function testUsdSellCalculation(): void
    {
        $nbpRate = new CurrencyRateDto(
            'USD',
            4.0000,
            new \DateTimeImmutable('2025-09-19')
        );

        $this->nbpClient
            ->expects($this->once())
            ->method('getSingleRateA')
            ->with('USD', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn($nbpRate);

        $date = new \DateTime('2025-09-19');
        $quote = $this->service->quote('USD', TradeSide::SELL, $date);

        $this->assertEquals('USD', $quote->code);
        $this->assertEquals('sell', $quote->side);
        $this->assertEquals(4.0000, $quote->nbpMid);
        $this->assertEquals(4.1100, $quote->price);
        $this->assertEquals('2025-09-19', $quote->effectiveDate->format('Y-m-d'));
    }

    public function testCzkSellCalculation(): void
    {
        $nbpRate = new CurrencyRateDto(
            'CZK',
            0.1800,
            new \DateTimeImmutable('2025-09-19')
        );

        $this->nbpClient
            ->expects($this->once())
            ->method('getSingleRateA')
            ->with('CZK', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn($nbpRate);

        $date = new \DateTime('2025-09-19');
        $quote = $this->service->quote('CZK', TradeSide::SELL, $date);

        $this->assertEquals('CZK', $quote->code);
        $this->assertEquals('sell', $quote->side);
        $this->assertEquals(0.1800, $quote->nbpMid);
        $this->assertEquals(0.3800, $quote->price);
        $this->assertEquals('2025-09-19', $quote->effectiveDate->format('Y-m-d'));
    }

    public function testCzkBuyThrowsException(): void
    {
        $this->expectException(UnsupportedOperationException::class);
        $this->expectExceptionMessage('BUY not supported for CZK');

        $date = new \DateTime('2025-09-19');
        $this->service->quote('CZK', TradeSide::BUY, $date);
    }

    public function testIdrBuyThrowsException(): void
    {
        $this->expectException(UnsupportedOperationException::class);
        $this->expectExceptionMessage('BUY not supported for IDR');

        $date = new \DateTime('2025-09-19');
        $this->service->quote('IDR', TradeSide::BUY, $date);
    }

    public function testBrlBuyThrowsException(): void
    {
        $this->expectException(UnsupportedOperationException::class);
        $this->expectExceptionMessage('BUY not supported for BRL');

        $date = new \DateTime('2025-09-19');
        $this->service->quote('BRL', TradeSide::BUY, $date);
    }

    public function testEurSellCalculation(): void
    {
        $nbpRate = new CurrencyRateDto(
            'EUR',
            4.2500,
            new \DateTimeImmutable('2025-09-19')
        );

        $this->nbpClient
            ->expects($this->once())
            ->method('getSingleRateA')
            ->with('EUR', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn($nbpRate);

        $date = new \DateTime('2025-09-19');
        $quote = $this->service->quote('EUR', TradeSide::SELL, $date);

        $this->assertEquals('EUR', $quote->code);
        $this->assertEquals('sell', $quote->side);
        $this->assertEquals(4.2500, $quote->nbpMid);
        $this->assertEquals(4.3600, $quote->price);
        $this->assertEquals('2025-09-19', $quote->effectiveDate->format('Y-m-d'));
    }

    public function testUsdBuyCalculation(): void
    {
        $nbpRate = new CurrencyRateDto(
            'USD',
            4.0000,
            new \DateTimeImmutable('2025-09-19')
        );

        $this->nbpClient
            ->expects($this->once())
            ->method('getSingleRateA')
            ->with('USD', $this->isInstanceOf(\DateTimeInterface::class))
            ->willReturn($nbpRate);

        $date = new \DateTime('2025-09-19');
        $quote = $this->service->quote('USD', TradeSide::BUY, $date);

        $this->assertEquals('USD', $quote->code);
        $this->assertEquals('buy', $quote->side);
        $this->assertEquals(4.0000, $quote->nbpMid);
        $this->assertEquals(3.8500, $quote->price);
        $this->assertEquals('2025-09-19', $quote->effectiveDate->format('Y-m-d'));
    }
}
