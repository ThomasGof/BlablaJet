<nav>
    <header id='head'>
        <img id='globe' src="assets/img/jet.png" alt="logoJet">
        <h1 style="text-align: center;">Bienvennu sur BlablaJet n1 du Cojeting ! Rechercher votre Cojeteur</h1>
    </header>
    <div id='nav'>

        <?php
        if (isset($_SESSION['pseudo'])) {
            if (!empty($_SESSION['avatar'])) {
                echo '<img src=' . $_SESSION['avatar'] . ' >';
            }
            echo '<p>Bonjour <br>' . $_SESSION['pseudo'] . '</p>';
        }

        $racine = __DIR__;

        $newRacine = str_replace("templates", "", $racine);
        $siteMap = scandir($newRacine, SCANDIR_SORT_ASCENDING);
        foreach ($siteMap as $value) {
            $info = new SplFileInfo($value);
            if (($value === 'registration.php') && (isset($_SESSION['pseudo']))) {
                $value = 'index.php?deconnect=true';
                $ecrit = 'Deconnectez-Vous';
            } else if ($value === 'registration.php') {
                $ecrit = 'Identifiez-Vous';
            }
            if ($value === 'index.php') {
                $ecrit = 'HOME';
            }
            if ($value === 'indexGlobe.php') {
                $ecrit = 'Map Globe';
            }
            if ($value === 'newTrajet.php') {
                $ecrit = 'Crée votre Trajet';
            }
            if (($info->getExtension() === 'php') && ($value !== 'mapAdmin.php') && ($value !== 'userAdmin.php') && ($value !== '')) {
                // $ecrit = str_replace(".php", "", $value);
                echo "<a class='nav' href='$value'>$ecrit</a>";
            }
        }
        if ((isset($_SESSION['role'])) && ($_SESSION['role'] === "admin")) {
            echo "<a class='nav' href='mapAdmin.php'>CarteAdministrateur</a>";
            echo "<a class='nav' href='userAdmin.php'>UserAdministrateur</a>";
        }

        if (is_file(__DIR__)) {
            echo "<script>alert('je suis un truck pas bien !')</script>";
        }
        ?>

    </div>
    <div id='search'></div>
    <div id='adresseD'>Entrée le lieu de dépard</div>
    <div id='adresseA'>Entrée le lieu d' arriver</div>
    
</nav>