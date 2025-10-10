<?php

declare(strict_types=1);

namespace App\Dto;

class HistoricalRateDto
{
    public function __construct(
        public readonly string $code,
        public readonly float $mid,
        public readonly \DateTimeImmutable $effectiveDate
    ) {
    }

    public static function fromHistoricalItem(array $item, string $code): self
    {
        $mid = (float) ($item['mid'] ?? 0.0);
        $effectiveDate = new \DateTimeImmutable((string) ($item['effectiveDate'] ?? 'now'));
        return new self($code, $mid, $effectiveDate);
    }
}
