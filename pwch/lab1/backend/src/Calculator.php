<?php

namespace App;

class Calculator
{
    public function calculate(float $num1, float $num2, string $operation)
    {
        return match($operation) {
            '+' => $num1 + $num2,
            '-' => $num1 - $num2,
            '*' => $num1 * $num2,
            '/' => $this->divide($num1, $num2),
            default => throw new \InvalidArgumentException('Invalid operation')
        };
    }

    private function divide(float $num1, float $num2)
    {
        if ($num2 == 0) {
            throw new \DivisionByZeroError('Division by zero');
        }
        return $num1 / $num2;
    }
}

