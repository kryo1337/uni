<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Service\CantorPricingService;
use App\Service\NbpClient;
use App\Value\CurrencyCode;
use App\Value\TradeSide;
use App\Exception\CurrencyNotFoundException;
use App\Exception\UnsupportedOperationException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final class RatesController extends AbstractController
{
    public function __construct(
        private readonly NbpClient $nbpClient,
        private readonly CantorPricingService $cantorPricingService
    ) {
    }

    public function getRate(string $code, Request $request): JsonResponse
    {
        return $this->handleApiErrors(function () use ($code, $request) {
            $currency = $this->validateCurrencyCode($code);
            $date = $this->parseDateParameter($request);

            $rate = $this->nbpClient->getSingleRateA($currency->getValue(), $date);

            return $this->json([
                'code' => $rate->code,
                'mid' => $rate->mid,
                'effectiveDate' => $rate->effectiveDate->format('Y-m-d'),
            ]);
        });
    }

    public function getHistory(string $code, Request $request): JsonResponse
    {
        return $this->handleApiErrors(function () use ($code, $request) {
            $currency = $this->validateCurrencyCode($code);
            $endDate = $this->parseDateParameter($request);
            $startDate = $endDate->modify('-14 days');

            $items = $this->nbpClient->getHistoryA($currency->getValue(), $startDate, $endDate);

            $formattedItems = array_map(function ($item) {
                return [
                    'effectiveDate' => $item->effectiveDate->format('Y-m-d'),
                    'mid' => $item->mid,
                ];
            }, $items);

            return $this->json([
                'code' => $currency->getValue(),
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
                'items' => $formattedItems,
            ]);
        });
    }

    public function getCantorQuote(string $code, Request $request): JsonResponse
    {
        return $this->handleApiErrors(function () use ($code, $request) {
            $currency = $this->validateCurrencyCode($code);
            $side = $this->validateTradeSide($request);
            $date = $this->parseDateParameter($request);

            $quote = $this->cantorPricingService->quote($currency->getValue(), $side, $date);

            return $this->json([
                'code' => $quote->code,
                'side' => $quote->side,
                'nbpMid' => $quote->nbpMid,
                'price' => $quote->price,
                'effectiveDate' => $quote->effectiveDate->format('Y-m-d'),
            ]);
        });
    }

    private function validateCurrencyCode(string $code): CurrencyCode
    {
        try {
            return CurrencyCode::fromString($code);
        } catch (\InvalidArgumentException $e) {
            throw $this->createNotFoundException(sprintf('Currency code "%s" is not supported', $code));
        }
    }

    private function parseDateParameter(Request $request): \DateTimeImmutable
    {
        $dateStr = $request->query->get('date');
        if ($dateStr === null) {
            return new \DateTimeImmutable();
        }

        try {
            $date = \DateTimeImmutable::createFromFormat('Y-m-d', $dateStr);
            if ($date === false) {
                throw new \InvalidArgumentException('Invalid date format');
            }
            return $date;
        } catch (\Exception $e) {
            throw $this->createNotFoundException('Invalid date format. Use YYYY-MM-DD.');
        }
    }

    private function validateTradeSide(Request $request): TradeSide
    {
        $sideStr = $request->query->get('side');
        if ($sideStr === null) {
            throw new \InvalidArgumentException('side parameter is required');
        }

        return match (strtolower($sideStr)) {
            'buy' => TradeSide::BUY,
            'sell' => TradeSide::SELL,
            default => throw new \InvalidArgumentException(sprintf('Invalid trade side: %s', $sideStr))
        };
    }

    private function handleApiErrors(callable $operation): JsonResponse
    {
        try {
            return $operation();
        } catch (CurrencyNotFoundException $e) {
            return $this->json(['error' => $e->getMessage()], 404);
        } catch (UnsupportedOperationException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        } catch (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], 404);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Internal server error'], 500);
        }
    }
}
