<?php

declare(strict_types=1);

namespace App\Service;

use App\Dto\CurrencyRateDto;
use App\Dto\HistoricalRateDto;
use App\Dto\TableARatesDto;
use App\Exception\CurrencyNotFoundException;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class NbpClient
{
    public function __construct(private readonly HttpClientInterface $http)
    {
    }

    public function getTableA(\DateTimeInterface $date): TableARatesDto
    {
        $url = sprintf('https://api.nbp.pl/api/exchangerates/tables/A/%s/?format=json', $date->format('Y-m-d'));
        try {
            $response = $this->http->request('GET', $url, [
                'headers' => ['Accept' => 'application/json'],
                'timeout' => 5.0,
            ]);
            $status = $response->getStatusCode();
            if ($status === 404) {
                throw new CurrencyNotFoundException('Table A not found for date ' . $date->format('Y-m-d'));
            }
            $data = $response->toArray(false);
            if (!is_array($data) || !isset($data[0]) || !is_array($data[0])) {
                throw new \JsonException('Invalid JSON structure for table A');
            }
            return TableARatesDto::fromPayload($data[0]);
        } catch (HttpExceptionInterface $e) {
            if ($e->getCode() === 404) {
                throw new CurrencyNotFoundException('Table A not found for date ' . $date->format('Y-m-d'));
            }
            throw $e;
        } catch (TransportExceptionInterface $e) {
            throw $e;
        }
    }

    public function getSingleRateA(string $code, \DateTimeInterface $date): CurrencyRateDto
    {
        $url = sprintf('https://api.nbp.pl/api/exchangerates/rates/A/%s/%s/?format=json', urlencode($code), $date->format('Y-m-d'));
        try {
            $response = $this->http->request('GET', $url, [
                'headers' => ['Accept' => 'application/json'],
                'timeout' => 5.0,
            ]);
            $status = $response->getStatusCode();
            if ($status === 404) {
                throw new CurrencyNotFoundException(sprintf('Currency %s not found for %s', $code, $date->format('Y-m-d')));
            }
            $data = $response->toArray(false);
            return CurrencyRateDto::fromSingleRatePayload($data);
        } catch (HttpExceptionInterface $e) {
            if ($e->getCode() === 404) {
                throw new CurrencyNotFoundException(sprintf('Currency %s not found for %s', $code, $date->format('Y-m-d')));
            }
            throw $e;
        } catch (TransportExceptionInterface $e) {
            throw $e;
        }
    }

    public function getHistoryA(string $code, \DateTimeInterface $start, \DateTimeInterface $end): array
    {
        $url = sprintf(
            'https://api.nbp.pl/api/exchangerates/rates/A/%s/%s/%s/?format=json',
            urlencode($code),
            $start->format('Y-m-d'),
            $end->format('Y-m-d')
        );
        try {
            $response = $this->http->request('GET', $url, [
                'headers' => ['Accept' => 'application/json'],
                'timeout' => 5.0,
            ]);
            $status = $response->getStatusCode();
            if ($status === 404) {
                throw new CurrencyNotFoundException(sprintf('Currency %s not found in range %s..%s', $code, $start->format('Y-m-d'), $end->format('Y-m-d')));
            }
            $data = $response->toArray(false);
            $rates = $data['rates'] ?? [];
            $items = [];
            if (is_array($rates)) {
                foreach ($rates as $rate) {
                    if (is_array($rate)) {
                        $items[] = HistoricalRateDto::fromHistoricalItem($rate, $code);
                    }
                }
            }
            return $items;
        } catch (HttpExceptionInterface $e) {
            if ($e->getCode() === 404) {
                throw new CurrencyNotFoundException(sprintf('Currency %s not found in range %s..%s', $code, $start->format('Y-m-d'), $end->format('Y-m-d')));
            }
            throw $e;
        } catch (TransportExceptionInterface $e) {
            throw $e;
        }
    }
}