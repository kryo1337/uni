<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\HistoryManager;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$historyManager = new HistoryManager();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($historyManager->getHistory());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    
    if ($request['action'] === 'clear') {
        echo json_encode($historyManager->clearHistory());
    } elseif ($request['action'] === 'add' && isset($request['entry'])) {
        echo json_encode($historyManager->addEntry($request['entry']));
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }
    exit;
}

echo json_encode(['error' => 'Invalid request']);
?>
