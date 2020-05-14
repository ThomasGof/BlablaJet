<?php
require_once "libraries/autoloader.php";
?>

<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Identification</title>
    <link rel="stylesheet" type="text/css" href="assets/css/style.css" />
</head>

<body>
    <?php
    Nav::displayNav();
    include("templates/nav.html.php");
    ?>
    <div id="viewDiv"></div>
    <main>
        <div>
            <div>
                <h4>Déja inscrit?</h4>
                <?php
                Users::connectForm();
                include "templates/connectForm.html.php";
                ?>
            </div>
            <div>
                <h4>Rejoignez-nous!</h4>
                <?php
                Users::regForm();
                include "templates/regForm.html.php";
                ?>
            </div>
        </div>
    </main>
</body>

</html>