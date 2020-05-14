<?php

abstract class Model {
    public static function select($champ,$table,$order,$limite,$where,$valueWhere){
        require "pdo.php";
        $rq = $pdo -> prepare("SELECT $champ FROM $table $order $limite $where");
        if($valueWhere === ''){
            $rq->execute();
        } else {
            $rq->execute($valueWhere);
        }
        
        return $rq;
    }
    public static function insert($champ,$table,$prepValues,$values){
        require "pdo.php";
        $rq = $pdo->prepare("INSERT INTO $table($champ) VALUES($prepValues)");
        $rq->execute($values);
    }
    public static function delete(){

    }
    // UPDATE users (id_users,role) VALUES (?,?) [$id_users,$role]
    // Model::update('users','id_users,role','?,?',[$_POST['id_users'],$_POST['role']]," WHERE id_users=".$_POST['role']);
    public static function update($table,$champ,$prepValues,$values,$where){
        require "pdo.php";
        $rq = $pdo->prepare("UPDATE $table($champ) VALUES($prepValues) $where");
        $rq->execute($values);
    }

}