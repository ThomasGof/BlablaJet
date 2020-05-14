<form action="admin.php" method="POST">
    <table>
        <tr>
            <td>id_users</td>
            <td>Pseudo</td>
            <td>Email</td>
            <td>Role</td>
            <td>Avatar</td>
            <td>Date Inscr</td>
            <td></td>
            <td></td>
        </tr>
        <?php foreach ($userList as $value) { ?>
            <tr>
                <td><?= $value['id_users'] ?></td>
                <td><?= $value['pseudo'] ?></td>
                <td><?= $value['email'] ?></td>
                <td>
                    <select name="role">
                        <option value="simple_user" <?php Users::roleSelect("simple_user",$value['role']); ?>>simple_user</option>
                        <option value="contributor" <?php Users::roleSelect("contributor",$value['role']); ?>>contributor</option>
                        <option value="admin" <?php Users::roleSelect("admin",$value['role']); ?>>admin</option>
                    </select>
                
                <?= $value['role'] ?></td>
                <td>
                    <?php if (!empty($value['avatar'])) : ?>
                        <img src='<?= $value['avatar'] ?>' width="40px">
                    <?php endif; ?>
                </td>
                <td><?= $value['reg_date'] ?></td>
                <td><button type="submit" name="userDelete" value="userDelete">supprimer</button></td>
                <td><button type="submit" name="showUsersForm" value="showUsersForm">Envoyer</button></td>
            
            </tr>
        <?php } ?>
    </table>
</form>