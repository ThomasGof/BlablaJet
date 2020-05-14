<?php
require_once "autoloader.php";

class Users
{
    /**
     * 
     * Gestion utilisateurs
     * 
     * 
     */
    public static function admin()
    {
        if ($_SESSION['role'] !== "admin") {
            header("Location: index.php");
        }
    }
    public static function showUsers(){
      $rq = Model::select('*','users',' ORDER BY pseudo','','','');
      $userList = [];

        while($result = $rq -> fetch(PDO::FETCH_ASSOC)){
            array_push($userList,$result); 
        }
        return $userList;
    }
    public static function roleSelect($option,$userSelect){
      if($option === $userSelect){
        echo "selected";
      }
    }
    /**
   * 
   * Formulaires utilisateurs
   * 
   * 
   */

    public static function connectForm()
    {
        $dataConnect = "";
        if (isset($_POST['formConnect']) && !empty($_POST['formConnect'])) {
            $dataConnect = $_POST;
        }
        if ($dataConnect !== "") {
            $erreur = "";
            if (!empty($dataConnect['email']) && !empty($dataConnect['password'])) {
                $email = $dataConnect['email'];
                $password = hash('sha256', $dataConnect['password']);
                $rq = Model::select('*', 'users', '', '', " WHERE email=? AND password=?", [$email, $password]);
                $active = $rq->rowCount();
            } else {
                $erreur .= "<div>Une erreur s'est produite lors de votre saisie.</div>";
            }
            if ($active !== 0) {
                // reussite -> enregister dans $_SESSION les données de l'utilisateur
                $result = $rq->fetch(PDO::FETCH_ASSOC);
                $_SESSION['pseudo'] = $result['pseudo'];
                $_SESSION['avatar'] = $result['avatar'];
                $_SESSION['role'] = $result['role'];
                header("Location: index.php");
            } else {
                $erreur .= "<div>Une erreur s'est produite lors de votre saisie.</div>";
            }
            echo $erreur;
        }
    }
    public static function regForm()
  {
    $dataReg = "";
    $imgFile = "";
    if (isset($_POST['formReg']) && !empty($_POST['formReg'])) {
      $dataReg = $_POST;
      if (!empty($_FILES['avatar'])) {
        $imgFile = $_FILES['avatar'];
      }
    }
    if ($dataReg !== "") {
      //insertion avec formulaire d'inscription protégé
      $erreur = '';
      $urlAvatar = '';
      //filtres
      // plus rapide : $dataReg = array_map('htmlspecialchars', $dataReg);
      foreach ($dataReg as $key => $value) {
        $dataReg[$key] = htmlspecialchars($value, ENT_QUOTES, "UTF-8");
        if (empty($value)) {
          $erreur .= "<div>Le champ $key est vide.</div>";
        }
      }
      if ($dataReg['password1'] !== $dataReg['password2'] && !empty($dataReg['password1'])) {
        $erreur .= "<div>Vos mots de pass ne sont pas identiques.</div>";
      }
      if (filter_var($dataReg['email'], FILTER_VALIDATE_EMAIL)) {
        $selectEmail = Model::select('email', 'users', '', '', " WHERE email=?", [$dataReg['email']]);
        $result = $selectEmail->rowCount();
        if ($result !== 0) {
          $erreur .= "<div>Vous êtes déjà enregistré sur ce site.</div>";
        }
      } else {
        $erreur .= "<div>Le format de votre email n'est pas valide.</div>";
      }
      // detection image
      if (!empty($imgFile) && $imgFile['size'] > 0) {
        $urlAvatar = Image::imgResize($imgFile, 300, 'assets/img/');
      }
      if ($erreur === "") {
        Model::insert(
          'pseudo,email,password,avatar,reg_Date',
          'users',
          '?,?,?,?,?',
          [$dataReg['pseudo'], $dataReg['email'], hash('sha256', $dataReg['password1']), $urlAvatar, date("Y-m-d")]
        );
        $_SESSION['pseudo'] = $dataReg['pseudo'];
        $_SESSION['avatar'] = $urlAvatar;
        $_SESSION['numValide'] = rand(1,1000000);
        $numValide = $_SESSION['numValide'];

        $to = $dataReg['email'];
        $subject = "HTML email";
    
        $message = "
        <html>
        <head>
        <title>HTML email</title>
        </head>
        <body>
          <p>Bienvenue a toi ".$dataReg['pseudo'].  
        "<br>Valide ton inscription avec le lien :index.php?validation=".$numValide."</p></body>
        </html>
        ";
    
        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    
        // More headers
        $headers .= 'From: <webmaster@example.com>' . "\r\n";
        $headers .= 'Cc: myboss@example.com' . "\r\n";
    
        mail($to,$subject,$message,$headers);


        header("Location: index.php");
      } else {
        echo $erreur;
      }
    }
  }
    
}
