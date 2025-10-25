<?php

namespace Tests;

use App\Calculator;
use PHPUnit\Framework\TestCase;

class CalculatorTest extends TestCase
{
    private Calculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new Calculator();
    }

    public function testAddition(): void
    {
        $result = $this->calculator->calculate(5, 3, '+');
        $this->assertEquals(8, $result);
    }

    public function testAdditionWithDecimals(): void
    {
        $result = $this->calculator->calculate(5.5, 3.2, '+');
        $this->assertEquals(8.7, $result, '', 0.0001);
    }

    public function testSubtraction(): void
    {
        $result = $this->calculator->calculate(10, 4, '-');
        $this->assertEquals(6, $result);
    }

    public function testSubtractionNegativeResult(): void
    {
        $result = $this->calculator->calculate(3, 7, '-');
        $this->assertEquals(-4, $result);
    }

    public function testMultiplication(): void
    {
        $result = $this->calculator->calculate(6, 7, '*');
        $this->assertEquals(42, $result);
    }

    public function testMultiplicationWithZero(): void
    {
        $result = $this->calculator->calculate(5, 0, '*');
        $this->assertEquals(0, $result);
    }

    public function testDivision(): void
    {
        $result = $this->calculator->calculate(15, 3, '/');
        $this->assertEquals(5, $result);
    }

    public function testDivisionWithDecimals(): void
    {
        $result = $this->calculator->calculate(10, 4, '/');
        $this->assertEquals(2.5, $result);
    }

    public function testDivisionByZeroThrowsException(): void
    {
        $this->expectException(\DivisionByZeroError::class);
        $this->calculator->calculate(10, 0, '/');
    }

    public function testInvalidOperationThrowsException(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->calculator->calculate(5, 3, '%');
    }

    public function testInvalidOperationWithSpecialCharacter(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->calculator->calculate(5, 3, '^');
    }
}

