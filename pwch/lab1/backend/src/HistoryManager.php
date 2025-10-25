<?php

namespace App;

class HistoryManager
{
    private string $historyFile;

    public function __construct(string $historyFile = null)
    {
        $this->historyFile = $historyFile ?? __DIR__ . '/../history.json';
        $this->ensureHistoryFileExists();
    }

    private function ensureHistoryFileExists(): void
    {
        if (!file_exists($this->historyFile)) {
            file_put_contents($this->historyFile, json_encode(['history' => []]));
        }
    }

    public function getHistory(): array
    {
        $data = json_decode(file_get_contents($this->historyFile), true);
        return $data ?: ['history' => []];
    }

    public function addEntry(array $entry): array
    {
        $data = $this->getHistory();
        array_unshift($data['history'], $entry);
        $data['history'] = array_slice($data['history'], 0, 10);
        $this->saveHistory($data);
        return $data;
    }

    public function clearHistory(): array
    {
        $data = ['history' => []];
        $this->saveHistory($data);
        return $data;
    }

    private function saveHistory(array $data): void
    {
        file_put_contents($this->historyFile, json_encode($data, JSON_PRETTY_PRINT));
    }
}

