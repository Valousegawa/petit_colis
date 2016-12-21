<?php
require_once("Rest.inc.php");

class API extends REST
{

    public $data = "";

    const DB_SERVER = "127.0.0.1";
    const DB_USER = "root";
    const DB_PASSWORD = "";
    const DB = "petit_colis";

    private $db = NULL;

    /*
     *  Connect to Database
    */
    private function dbConnect()
    {
        $db = new PDO('mysql:host=' . self::DB_SERVER . ';dbname=' . self::DB . ';charset=utf8', self::DB_USER, self::DB_PASSWORD);
        return $db;
    }

    /*
     * Dynamically call the method based on the query string
     */
    public function processApi()
    {
        $func = strtolower(trim(str_replace("/", "", $_REQUEST['x'])));
        if ((int)method_exists($this, $func) > 0)
            $this->$func();
        else
            $this->response('', 404); // If the method not exist with in this class "Page not found".
    }


    // Fonction qui gère la connexion a un compte
    private function login()
    {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        $user = json_decode(file_get_contents("php://input"), true);
        $db = $this->dbConnect();

        $query = $db->prepare("SELECT * FROM users WHERE mail = :mail AND mdp = :mdp");
        $query->bindValue(':mail', $user[0]);
        $query->bindValue(':mdp', $user[1]);
        $query->execute();

        $result = $query->fetch(PDO::FETCH_ASSOC);
        if (!$result) {
            echo 0;
        } else {
            $this->json($result);
        }
    }

    // Fonction qui permet l'envoie des valeurs à la BDD
    private function inscription()
    {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        $users = json_decode(file_get_contents("php://input"), true);
        $db = $this->dbConnect();

        $check_existing_mail = $db->prepare("SELECT COUNT(*) AS 'total' FROM users WHERE mail = :mail LIMIT 1");
        $check_existing_mail->bindValue(':mail', $users[3]);
        $check_existing_mail->execute();
        $result = $check_existing_mail->fetchObject();

        if ($result->total == 0) {
            if ($users[6] == NULL) {
                $users[6] = 0;
            }
            $date_inscription = new DateTime("now");
            //Il n'est pas possible en base de données de mettre une valeur par défaut à un champs texte
            $uri = "img/avatar/default.png";
            $query = $db->prepare("INSERT INTO users(genre, user_prenom, user_nom, mail, mdp, naissance, newsletter, date_inscription, is_entreprise, is_particulier, pic) VALUES(:genre, :prenom, :nom, :mail, :mdp, :naissance, :newsletter, :date_inscription, :is_e, :is_p, :pic)");
            $query->bindValue(':genre', $users[0]);
            $query->bindValue(':prenom', $users[1]);
            $query->bindValue(':nom', $users[2]);
            $query->bindValue(':mail', $users[3]);
            $query->bindValue(':mdp', $users[4]);
            $query->bindValue(':naissance', $users[5]);
            $query->bindValue(':newsletter', $users[6]);
            $query->bindValue(':date_inscription', $date_inscription->format('Y-m-d'));
            $query->bindValue(':is_e', $this->is_entreprise($users[7]));
            $query->bindValue(':is_p', $this->is_particulier($users[7]));
            $query->bindValue(':pic', $uri);
            $query->execute();

            echo 1;
        } else {
            echo 0;
        }
    }

    public function is_entreprise($v)
    {
        if ($v == "e") {
            return $is_entreprise = 1;
        } else {
            return $is_entreprise = 0;
        }
    }

    public function is_particulier($v)
    {
        if ($v == "p") {
            return $is_particulier = 1;
        } else {
            return $is_particulier = 0;
        }
    }

    private function showLastComment()
    {
        $db = $this->dbConnect();
        $query = $db->prepare("SELECT user_nom, user_prenom, note, commentaire, pic FROM users, temoignage WHERE id_user = idUsers ORDER BY idTemoignage DESC LIMIT 5");
        $query->execute();
        $result = array();
        while ($r = $query->fetch(PDO::FETCH_ASSOC)) {
            $result[] = $r;
        }
        $this->json($result);
    }

    // Ajoute un commentaire
    private function addComment()
    {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        $comment = json_decode(file_get_contents("php://input"), true);
        $db = $this->dbConnect();

        $query = $db->prepare("INSERT INTO temoignage(id_user, note, commentaire) VALUES(:user, :note, :commentaire)");
        $query->bindValue(':user', $comment[0]);
        $query->bindValue(':note', $comment[1]);
        $query->bindValue(':commentaire', $comment[2]);
        $query->execute();
    }

    //Montre les dernieres annonces
    private function showLastAdvert()
    {
        $db = $this->dbConnect();
        $query = $db->prepare("SELECT * FROM annonce, users, delai, moyens_transport WHERE id_voyageur = idUsers AND id_delai = idDelai AND id_moyen_transport = idMoyens_transport ORDER BY idAnnonce DESC LIMIT 5");
        $query->execute();
        $result = array();
        while ($r = $query->fetch(PDO::FETCH_ASSOC)) {
            $result[] = $r;
        }
        $this->json($result);
    }

    //Méthode d'upload d'avatar
    private function upload_avatar()
    {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        $user = json_decode(file_get_contents("php://input"), true);

        //Get file type
        $data = explode("/", $user[1]);
        $type = explode(";", $data[1]);

        //God save the file
        $imgData = str_replace(' ','+',$user[1]);
        $imgData =  substr($imgData,strpos($imgData,",")+1);
        $imgData = base64_decode($imgData);
        $filePath = $_SERVER['DOCUMENT_ROOT'] . '/petit_colis/img/avatar/' . $user[0] . '.' . $type[0];
        $file = fopen($filePath, 'w');
        fwrite($file, $imgData);
        fclose($file);

        $db = $this->dbConnect();
        $query = $db->prepare("UPDATE users SET pic = :uri WHERE idUsers = :id");
        $query->bindValue(':id', $user[0]);
        $query->bindValue(':uri', 'img/avatar/' . $user[0] . '.' . $type[0]);
        $query->execute();
    }

    //Permet le changement d'inscription de newsletter
    private function toggle_newsletter()
    {
        $user = json_decode(file_get_contents("php://input"), true);
        $db = $this->dbConnect();
        $query = $db->prepare("UPDATE users SET newsletter = :state WHERE idUsers = :id");
        $query->bindValue(':id', $user[0]);
        $query->bindValue(':state', $user[1]);
        $query->execute();
    }

    //Ajoute une annonce
    private function addAdvert(){
            if($this->get_request_method() !="POST"){
                $this->response('', 406);
            }
            $advert = json_decode(file_get_contents("php://input"),true);
            var_dump($advert);
            $db = $this->dbConnect();

            if($advert['a_r'] == NULL){
                $date_f = NULL;
            }
            else{
                $date_fin = new DateTime($advert['date_fin']);
                $date_f = $date_fin->format("Y-m-d");
            }
            $date_deb = new DateTime($advert['date_debut']);
            $query = $db->prepare("INSERT INTO annonce(ville_dep, ville_arr, date_debut, date_fin, id_voyageur, id_delai, commentaire, id_moyen_transport, prix, nbr_kilos, id_type_colis, a_r) VALUES(:ville_dep, :ville_arr, :date_debut, :date_fin, :id_voyageur, :id_delai, :commentaire, :id_moyen_transport, :prix, :nbr_kilos, :id_type_colis, :a_r)");
            $query->bindValue(':ville_dep', $advert['ville_dep']);
            $query->bindValue(':ville_arr', $advert['ville_arr']);
            $query->bindValue(':date_debut', $date_deb->format("Y-m-d"));
            $query->bindValue(':date_fin', $date_f);
            $query->bindValue(':id_voyageur', $advert['id_voyageur']);
            $query->bindValue(':id_delai', $advert['id_delai']);
            $query->bindValue(':commentaire', $advert['commentaire']);
            $query->bindValue(':id_moyen_transport', $advert['id_moyen_transport']);
            $query->bindValue(':prix', $advert['prix']);
            $query->bindValue(':nbr_kilos', $advert['nbr_kilos']);
            $query->bindValue(':id_type_colis', $advert['id_type_colis']);
            $query->bindValue(':a_r', $advert['a_r']);
            $query->execute();
        }

    private function showAdverts(){
            if($this->get_request_method() !="POST"){
                $this->response('', 406);
            }
            $advert = json_decode(file_get_contents("php://input"),true);
            $db = $this->dbConnect();
            if($advert[2] == NULL){
                $query = $db->prepare("SELECT * FROM annonce, users, delai, moyens_transport, types_colis WHERE idUsers=id_voyageur AND idDelai=id_delai AND id_moyen_transport=idMoyens_transport AND id_type_colis=idTypes_colis AND ville_dep=:ville_dep AND ville_arr=:ville_arr");
                $query->bindValue(':ville_dep', $advert[0]);
                $query->bindValue(':ville_arr', $advert[1]);
                $query->execute();
            }
            else{
                $d_d = new DateTime($advert[2], new DateTimeZone('Europe/Paris'));
                $d_d->add(new DateInterval('PT1H'));
                $query = $db->prepare("SELECT * FROM annonce, users, delai, moyens_transport, types_colis WHERE idUsers=id_voyageur AND idDelai=id_delai AND id_moyen_transport=idMoyens_transport AND id_type_colis=idTypes_colis AND ville_dep=:ville_dep AND ville_arr=:ville_arr AND date_debut=:date_debut");
                $query->bindValue(':ville_dep', $advert[0]);
                $query->bindValue(':ville_arr', $advert[1]);
                $query->bindValue(':date_debut', $d_d->format("Y-m-d"));
                $query->execute();
            }           
            $result = array(); 
            while ($r = $query->fetch(PDO::FETCH_ASSOC)){
                $result[] = $r;
            }

            if($advert[2] == NULL){
                $query = $db->prepare("SELECT * FROM annonce, users, delai, moyens_transport, types_colis WHERE idUsers=id_voyageur AND idDelai=id_delai AND id_moyen_transport=idMoyens_transport AND id_type_colis=idTypes_colis AND ville_dep=:ville_arr AND ville_arr=:ville_dep AND a_r=1");
                $query->bindValue(':ville_dep', $advert[0]);
                $query->bindValue(':ville_arr', $advert[1]);
                $query->execute();
            }
            else{
                $d_d = new DateTime($advert[2], new DateTimeZone('Europe/Paris'));
                $d_d->add(new DateInterval('PT1H'));
                $query = $db->prepare("SELECT * FROM annonce, users, delai, moyens_transport, types_colis WHERE idUsers=id_voyageur AND idDelai=id_delai AND id_moyen_transport=idMoyens_transport AND id_type_colis=idTypes_colis AND ville_dep=:ville_arr AND ville_arr=:ville_dep AND a_r=1 AND date_fin=:date_debut");
                $query->bindValue(':ville_dep', $advert[0]);
                $query->bindValue(':ville_arr', $advert[1]);
                $query->bindValue(':date_debut', $d_d->format("Y-m-d"));
                $query->execute();
            }
            while ($r = $query->fetch(PDO::FETCH_ASSOC)){
                $result[] = $r;
            }
            $this->json($result);
    }

    private function showDetail(){
    	if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $detail = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $query = $db->prepare("SELECT * FROM annonce, users, delai, moyens_transport, types_colis WHERE idUsers=id_voyageur AND idDelai=id_delai AND id_moyen_transport=idMoyens_transport AND id_type_colis=idTypes_colis AND idAnnonce=:id");
        $query->bindValue(':id', $detail);
        $query->execute();
        $result = array(); 
        while ($r = $query->fetch(PDO::FETCH_ASSOC)){
            $result[] = $r;
        }
        $this->json($result);
    }

    //Récupère la liste des délais
    private function getDelai()
    {
        $db = $this->dbConnect();
        $result = array();
        $query = $db->prepare("SELECT idDelai, nomDelai FROM delai");
        $query->execute();
        while ($r = $query->fetch(PDO::FETCH_ASSOC)) {
            $result[] = $r;
        }
        $this->json($result);
    }

    //Récupère la liste des moyens de transports
    private function getTransport()
    {
        $db = $this->dbConnect();
        $result = array();
        $query = $db->prepare("SELECT idMoyens_transport, nomMoyen_transport FROM moyens_transport");
        $query->execute();
        while ($r = $query->fetch(PDO::FETCH_ASSOC)) {
            $result[] = $r;
        }
        $this->json($result);
    }

    //Récupère tous les types de colis
    private function getType()
    {
        $db = $this->dbConnect();
        $result = array();
        $query = $db->prepare("SELECT idTypes_Colis, nomType_colis FROM types_colis");
        $query->execute();
        while ($r = $query->fetch(PDO::FETCH_ASSOC)) {
            $result[] = $r;
        }
        $this->json($result);
    }

    /*
     * Gestion des messages entre utilisateurs
     * Si l'id de l'utilisateur actuel correspond à l'id du voyageur, on affiche tous les messages de l'annonce
     * Sinon, on affiche uniquement les messages correspondant au couple
     */
    private function getMessages()
    {
        if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $infos = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $id_annonce = $infos[0];
        $id_user = $infos[1];
        $id_voyageur = $infos[2];

        $result = array(); 
        $query = $db->prepare("SELECT * FROM histo_conv WHERE id_annonce=:id_annonce AND ((id_exp=:id_user AND id_dest=:id_voyageur) OR (id_exp=:id_voyageur AND id_dest=:id_user))");
        $query->bindValue(':id_annonce', $id_annonce);
        $query->bindValue(':id_user', $id_user);
        $query->bindValue(':id_voyageur', $id_voyageur);
        $query->execute();

        while ($r = $query->fetch(PDO::FETCH_ASSOC)){
            $result[] = $r;
        }
        $this->json($result);
    }

    /*
     * Gestion d'ajout de message
     * Simple code d'ajout en base de données
     */ 
    private function addMessage(){
        if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $infos = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $id_annonce = $infos[0];
        $id_exp = $infos[1];
        $id_dest = $infos[2];
        $message = $infos[3];
        $tmstp = date('Y-m-d H:i:s');;

        $query = $db->prepare("INSERT INTO histo_conv(id_annonce, id_exp, id_dest, timestamp, message) VALUES(:id_annonce, :id_exp, :id_dest, :tmstp, :message)");
        $query->bindValue(':id_annonce', $id_annonce);
        $query->bindValue(':id_exp', $id_exp);
        $query->bindValue(':id_dest', $id_dest);
        $query->bindValue(':message', $message);
        $query->bindValue(':tmstp', $tmstp);
        $query->execute();
    }

    //Affiche les clients ayant voulus contacter le voyageur pour une annonce donnée
    private function getVoyageurClients(){
        if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $infos = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $id_annonce = $infos[0];
        $id_voyageur = $infos[1];

        $query = $db->prepare("SELECT DISTINCT id_exp FROM histo_conv WHERE id_annonce = :id_annonce AND id_dest = :id_voyageur");
        $query->bindValue(':id_annonce', $id_annonce);
        $query->bindValue(':id_voyageur', $id_voyageur);
        $query->execute();

        $clients_id = $query->fetchAll();

        $client = array();
        foreach($clients_id as $client_id){
            $query = $db->prepare("SELECT * FROM users WHERE idUsers = :client_id");
            $query->bindValue(':client_id', $client_id[0]);
            $query->execute();
            $r = $query->fetch(PDO::FETCH_ASSOC);
            $client[] = $r;
        }
        $this->json($client);
    }

    //Affiche les voyageurs (annonces) auxquels le client a eu affaire
    private function getVoyageurs(){
        if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $infos = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $query = $db->prepare("SELECT DISTINCT id_dest FROM histo_conv WHERE id_exp = :id_exp");
        $query->bindValue(':id_exp', $infos);
        $query->execute();

        $clients_id = $query->fetchAll();

        $client = array();
        foreach($clients_id as $client_id){
            $query = $db->prepare("SELECT * FROM users WHERE idUsers = :client_id");
            $query->bindValue(':client_id', $client_id[0]);
            $query->execute();
            $r = $query->fetch(PDO::FETCH_ASSOC);
            $client[] = $r;
        }
        $this->json($client);
    }

    //Récupère les informations du voyageur
    private function getVoyageurInfos(){
        if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $infos = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $query = $db->prepare("SELECT * FROM users WHERE idUsers = :client_id");
        $query->bindValue(':client_id', $infos);
        $query->execute();
        $r = $query->fetchAll(PDO::FETCH_ASSOC);
        $this->json($r);
    }

    //Récupère le nombre de réponses pour une annonce
    private function getAnnonceAnswers(){
        if($this->get_request_method() !="POST"){
            $this->response('', 406);
        }
        $infos = json_decode(file_get_contents("php://input"),true);
        $db = $this->dbConnect();

        $query = $db->prepare("SELECT COUNT(idHisto_conv) AS cpt FROM histo_conv WHERE id_annonce = :id");
        $query->bindValue(':id', $infos);
        $query->execute();

        $this->json($query->fetch(PDO::FETCH_ASSOC));
    }

    /*
     *	Encode array into JSON
    */
    private function json($data)
    {
        if (is_array($data)) {
            echo json_encode($data);
        }
    }
}

// Initialize Library
$api = new API;
$api->processApi();
?>