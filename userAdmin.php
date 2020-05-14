<?php
require_once "libraries/autoloader.php";
?>

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>Admin</title>
<link rel="stylesheet" type="text/css" href="assets/css/style.css" />
</head>
<body>
<?php
Nav::displayNav();
include ("templates/nav.html.php");

Users::admin();
$userList = Users::showUsers();
include ("templates/showUsers.html.php");

?>

</body>
</html>