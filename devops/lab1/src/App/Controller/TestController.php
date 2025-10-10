<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\CantorPricingService;
use App\Service\NbpClient;
use App\Value\TradeSide;
use Symfony\Component\HttpFoundation\JsonResponse;

final class TestController
{
    public function testNbp(NbpClient $nbpClient, CantorPricingService $cantor): JsonResponse
    {
        try {
            $now = new \DateTimeImmutable();
            $rate = $nbpClient->getSingleRateA('EUR', $now);
            $quote = $cantor->quote('EUR', TradeSide::BUY, $now);

            return new JsonResponse([
                'nbp_rate' => [
                    'code' => $rate->code,
                    'mid' => $rate->mid,
                    'effectiveDate' => $rate->effectiveDate->format('Y-m-d'),
                ],
                'cantor_quote' => [
                    'code' => $quote->code,
                    'side' => $quote->side,
                    'nbpMid' => $quote->nbpMid,
                    'price' => $quote->price,
                    'effectiveDate' => $quote->effectiveDate->format('Y-m-d'),
                ],
            ]);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}


