<?php
 	require_once("Rest.inc.php");
	
	class API extends REST {
	
		public $data = "";
		
		const DB_SERVER = "127.0.0.1";
		const DB_USER = "root";
		const DB_PASSWORD = "";
		const DB = "petit_colis";

		private $db = NULL;
		
		/*
		 *  Connect to Database
		*/
		private function dbConnect(){
			$db = new PDO('mysql:host='.self::DB_SERVER.';dbname='.self::DB.';charset=utf8',self::DB_USER, self::DB_PASSWORD);
			return $db;
		}
		
		/*
		 * Dynmically call the method based on the query string
		 */
		public function processApi(){
			$func = strtolower(trim(str_replace("/","",$_REQUEST['x'])));
			if((int)method_exists($this,$func) > 0)
				$this->$func();
			else
				$this->response('',404); // If the method not exist with in this class "Page not found".
		}


		// Fonction qui gère la connexion a un compte


		private function login(){
			if($this->get_request_method() !="POST"){
				$this->response('', 406);
			}
			$user = json_decode(file_get_contents("php://input"),true);
			$db = $this->dbConnect();

			$query = $db->prepare("SELECT user_nom, user_prenom FROM users WHERE mail = :mail AND mdp = :mdp");
			$query->bindValue(':mail', $user[0]);
			$query->bindValue(':mdp', $user[1]);
			$query->execute();
		}


		// Fonction qui permet l'envoie des valeurs à la BDD


		private function inscription(){
			if($this->get_request_method() !="POST"){
				$this->response('', 406);
			}
			$users = json_decode(file_get_contents("php://input"),true);
			$db = $this->dbConnect();

			if($users[6] == NULL){
				$users[6] = 0;
			}
			$date_inscription = new DateTime("now");
			$query = $db->prepare("INSERT INTO users(genre, user_prenom, user_nom, mail, mdp, naissance, newsletter, date_inscription, is_entreprise, is_particulier) VALUES(:genre, :prenom, :nom, :mail, :mdp, :naissance, :newsletter, :date_inscription, :is_e, :is_p)");
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
			$query->execute();
		}


		public function is_entreprise($v){
			if($v == "e"){
				return $is_entreprise = 1;
			}
			else{
				return $is_entreprise = 0;
			}
		}
		public function is_particulier($v){
			if($v == "p"){
				return $is_particulier = 1;
			}
			else{
				return $is_particulier = 0;
			}
		}

		private function showLastComment(){
			$db = $this->dbConnect();
			$query = $db->prepare("SELECT user_nom, user_prenom, note, commentaire FROM users, temoignage WHERE id_user = idUsers ORDER BY id_user DESC LIMIT 5");
			$query->execute();
			$result = array(); 
			while ($r = $query->fetch(PDO::FETCH_ASSOC)){
				$result[] = $r;
			}
			$this->json($result);
		}

		private function addComment(){
			if($this->get_request_method() !="POST"){
				$this->response('', 406);
			}
			$comment = json_decode(file_get_contents("php://input"),true);
			$db = $this->dbConnect();

			$query = $db->prepare("INSERT INTO temoignage(id_user, note, commentaire) VALUES(:user, :note, :commentaire)");
			$query->bindValue(':user', $comment[0]);
			$query->bindValue(':note', $comment[1]);
			$query->bindValue(':commentaire', $comment[2]);
			$query->execute();
		}





		/*
		 *	Encode array into JSON
		*/
		private function json($data){
			if(is_array($data)){
				echo json_encode($data);
			}
		}
	}
	// Initiiate Library
	
	$api = new API;
	$api->processApi();
?>