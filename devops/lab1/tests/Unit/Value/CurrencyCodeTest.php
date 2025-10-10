<?php

namespace App\Tests\Unit\Value;

use App\Value\CurrencyCode;
use PHPUnit\Framework\TestCase;

class CurrencyCodeTest extends TestCase
{
    public function testValidCurrencyCodes(): void
    {
        $this->assertEquals('EUR', CurrencyCode::EUR->getValue());
        $this->assertEquals('USD', CurrencyCode::USD->getValue());
        $this->assertEquals('CZK', CurrencyCode::CZK->getValue());
        $this->assertEquals('IDR', CurrencyCode::IDR->getValue());
        $this->assertEquals('BRL', CurrencyCode::BRL->getValue());
    }

    public function testFromStringWithValidCodes(): void
    {
        $this->assertEquals(CurrencyCode::EUR, CurrencyCode::fromString('EUR'));
        $this->assertEquals(CurrencyCode::USD, CurrencyCode::fromString('USD'));
        $this->assertEquals(CurrencyCode::CZK, CurrencyCode::fromString('CZK'));
        $this->assertEquals(CurrencyCode::IDR, CurrencyCode::fromString('IDR'));
        $this->assertEquals(CurrencyCode::BRL, CurrencyCode::fromString('BRL'));
    }

    public function testFromStringWithInvalidCodeThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown currency code: GBP');

        CurrencyCode::fromString('GBP');
    }

    public function testFromStringWithEmptyStringThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown currency code: ');

        CurrencyCode::fromString('');
    }

    public function testFromStringWithNullThrowsException(): void
    {
        $this->expectException(\TypeError::class);

        CurrencyCode::fromString(null);
    }

    public function testFromStringWithLowercaseCode(): void
    {
        $this->assertEquals(CurrencyCode::EUR, CurrencyCode::fromString('eur'));
        $this->assertEquals(CurrencyCode::USD, CurrencyCode::fromString('usd'));
        $this->assertEquals(CurrencyCode::CZK, CurrencyCode::fromString('czk'));
    }

    public function testFromStringWithInvalidCurrency(): void
    {
        $invalidCodes = ['JPY', 'CHF', 'PLN', 'XYZ', '123'];

        foreach ($invalidCodes as $code) {
            try {
                CurrencyCode::fromString($code);
                $this->fail("Expected InvalidArgumentException for code: {$code}");
            } catch (\InvalidArgumentException $e) {
                $this->assertEquals("Unknown currency code: {$code}", $e->getMessage());
            }
        }
    }

    public function testEnumCasesMatchStringValues(): void
    {
        $this->assertEquals('EUR', CurrencyCode::EUR->value);
        $this->assertEquals('USD', CurrencyCode::USD->value);
        $this->assertEquals('CZK', CurrencyCode::CZK->value);
        $this->assertEquals('IDR', CurrencyCode::IDR->value);
        $this->assertEquals('BRL', CurrencyCode::BRL->value);
    }

    public function testGetValueMethod(): void
    {
        $this->assertEquals(CurrencyCode::EUR->value, CurrencyCode::EUR->getValue());
        $this->assertEquals(CurrencyCode::USD->value, CurrencyCode::USD->getValue());
        $this->assertEquals(CurrencyCode::CZK->value, CurrencyCode::CZK->getValue());
        $this->assertEquals(CurrencyCode::IDR->value, CurrencyCode::IDR->getValue());
        $this->assertEquals(CurrencyCode::BRL->value, CurrencyCode::BRL->getValue());
    }
}
