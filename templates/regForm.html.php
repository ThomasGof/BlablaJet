
<form class ="regForm" action="registration.php" method="POST" enctype="multipart/form-data">
  <fieldset>
    <legend>Incrivez-vous :</legend>
    <div class="form-group">
      <input type="text" class="form-control" placeholder="pseudo" name="pseudo">
    </div>
    <div class="form-group">
      <input type="password" class="form-control" placeholder="Mot de pass" name="password1">
    </div>
    <div class="form-group">
      <input type="password" class="form-control" placeholder="Vérification du mot de pass" name="password2">
    </div>
    <div class="form-group">
      <input type="email" class="form-control" aria-describedby="emailHelp" placeholder="Enter email" name="email"><br>
      <small id="emailHelp" class="form-text text-muted">Nous ne partagerons jamais votre email avec qui que ce soit.</small>
    </div>
    <label>Selectionnez une image pour votre profil :</label>
    <div class="form-group">
    <input type="file" class="form-control-file" aria-describedby="fileHelp" name="avatar"><br>
    <small id="fileHelp" class="form-text text-muted">Votre image doit être au format jpg, gif ou png et faire moins de 5Mo.</small>
    </div>
    <button type="submit" class="btn btn-primary" name="formReg" value="formReg">Envoyer</button>
  </fieldset>
</form>
<br>
<br>

