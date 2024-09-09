<?php
$servername = "localhost";
$username = "dafm5634_ag";
$password = "Ag7us777__";
$dbname = "dafm5634_modschedule";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, name FROM employees";
$result = $conn->query($sql);

$names = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $names[] = $row;
    }
}

header('Content-Type: application/json');
echo json_encode($names);

$conn->close();
?>
