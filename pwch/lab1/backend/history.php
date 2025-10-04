<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$historyFile = __DIR__ . '/history.json';

if (!file_exists($historyFile)) {
    file_put_contents($historyFile, json_encode(['history' => []]));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = json_decode(file_get_contents($historyFile), true);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    
    $data = json_decode(file_get_contents($historyFile), true);
    
    if (!$data) {
        $data = ['history' => []];
    }
    
    if ($request['action'] === 'clear') {
        $data['history'] = [];
    } elseif ($request['action'] === 'add' && isset($request['entry'])) {
        array_unshift($data['history'], $request['entry']);
        $data['history'] = array_slice($data['history'], 0, 10);
    }
    
    file_put_contents($historyFile, json_encode($data, JSON_PRETTY_PRINT));
    
    echo json_encode($data);
    exit;
}

echo json_encode(['error' => 'Invalid request']);
?>
