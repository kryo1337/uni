<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Calculator;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['num1']) || !isset($data['num2']) || !isset($data['operation'])) {
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$num1 = floatval($data['num1']);
$num2 = floatval($data['num2']);
$operation = $data['operation'];

$calculator = new Calculator();

try {
    $result = $calculator->calculate($num1, $num2, $operation);
    echo json_encode([
        'result' => $result,
        'num1' => $num1,
        'num2' => $num2,
        'operation' => $operation
    ]);
} catch (\DivisionByZeroError $e) {
    echo json_encode([
        'result' => 'Error: Division by zero',
        'num1' => $num1,
        'num2' => $num2,
        'operation' => $operation
    ]);
} catch (\InvalidArgumentException $e) {
    echo json_encode([
        'result' => 'Error: Invalid operation',
        'num1' => $num1,
        'num2' => $num2,
        'operation' => $operation
    ]);
}
?>
