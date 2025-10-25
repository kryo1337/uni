<?php

namespace Tests;

use App\HistoryManager;
use PHPUnit\Framework\TestCase;

class HistoryManagerTest extends TestCase
{
    private string $testHistoryFile;
    private HistoryManager $historyManager;

    protected function setUp(): void
    {
        $this->testHistoryFile = sys_get_temp_dir() . '/test_history_' . uniqid() . '.json';
        $this->historyManager = new HistoryManager($this->testHistoryFile);
    }

    protected function tearDown(): void
    {
        if (file_exists($this->testHistoryFile)) {
            unlink($this->testHistoryFile);
        }
    }

    public function testGetHistoryReturnsEmptyArrayInitially(): void
    {
        $history = $this->historyManager->getHistory();
        $this->assertIsArray($history);
        $this->assertArrayHasKey('history', $history);
        $this->assertEmpty($history['history']);
    }

    public function testAddEntry(): void
    {
        $entry = [
            'expression' => '5 + 3',
            'result' => 8,
            'timestamp' => '2025-10-25 12:00:00'
        ];

        $result = $this->historyManager->addEntry($entry);

        $this->assertArrayHasKey('history', $result);
        $this->assertCount(1, $result['history']);
        $this->assertEquals($entry, $result['history'][0]);
    }

    public function testAddMultipleEntries(): void
    {
        $entry1 = ['expression' => '5 + 3', 'result' => 8, 'timestamp' => '2025-10-25 12:00:00'];
        $entry2 = ['expression' => '10 - 2', 'result' => 8, 'timestamp' => '2025-10-25 12:01:00'];
        $entry3 = ['expression' => '4 * 2', 'result' => 8, 'timestamp' => '2025-10-25 12:02:00'];

        $this->historyManager->addEntry($entry1);
        $this->historyManager->addEntry($entry2);
        $result = $this->historyManager->addEntry($entry3);

        $this->assertCount(3, $result['history']);
        // Most recent should be first
        $this->assertEquals($entry3, $result['history'][0]);
        $this->assertEquals($entry2, $result['history'][1]);
        $this->assertEquals($entry1, $result['history'][2]);
    }

    public function testHistoryLimitedToTenEntries(): void
    {
        for ($i = 1; $i <= 15; $i++) {
            $entry = [
                'expression' => "$i + 1",
                'result' => $i + 1,
                'timestamp' => "2025-10-25 12:00:$i"
            ];
            $result = $this->historyManager->addEntry($entry);
        }

        $this->assertCount(10, $result['history']);
        // Should have entries 15 down to 6
        $this->assertEquals('15 + 1', $result['history'][0]['expression']);
        $this->assertEquals('6 + 1', $result['history'][9]['expression']);
    }

    public function testClearHistory(): void
    {
        $entry = ['expression' => '5 + 3', 'result' => 8, 'timestamp' => '2025-10-25 12:00:00'];
        $this->historyManager->addEntry($entry);

        $result = $this->historyManager->clearHistory();

        $this->assertArrayHasKey('history', $result);
        $this->assertEmpty($result['history']);
    }

    public function testHistoryPersistsToFile(): void
    {
        $entry = ['expression' => '5 + 3', 'result' => 8, 'timestamp' => '2025-10-25 12:00:00'];
        $this->historyManager->addEntry($entry);

        // Create new instance with same file
        $newHistoryManager = new HistoryManager($this->testHistoryFile);
        $history = $newHistoryManager->getHistory();

        $this->assertCount(1, $history['history']);
        $this->assertEquals($entry, $history['history'][0]);
    }
}

