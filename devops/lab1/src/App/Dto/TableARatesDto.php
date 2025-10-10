<?php

declare(strict_types=1);

namespace App\Dto;

class TableARatesDto
{
    public function __construct(
        public readonly string $table,
        public readonly string $no,
        public readonly \DateTimeImmutable $effectiveDate,
        public readonly array $rates
    ) {
    }

    public static function fromPayload(array $payload): self
    {
        $table = (string) ($payload['table'] ?? 'A');
        $no = (string) ($payload['no'] ?? '');
        $effectiveDateStr = (string) ($payload['effectiveDate'] ?? 'now');
        $effectiveDate = new \DateTimeImmutable($effectiveDateStr);
        $items = [];

        $rates = $payload['rates'] ?? [];
        if (is_array($rates)) {
            foreach ($rates as $rate) {
                if (is_array($rate)) {
                    $items[] = CurrencyRateDto::fromTableAItem($rate, $effectiveDateStr);
                }
            }
        }

        return new self($table, $no, $effectiveDate, $items);
    }
}
