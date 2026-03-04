package com.lkl.studygroup;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudygroupApplication {

	public static void main(String[] args) {
		System.out.println("\n\n====== SUPER EARLY ENVIRONMENT VARIABLES DUMP ======");
		System.out.println("DB_POSTGRES_URL: " + System.getenv("DB_POSTGRES_URL"));
		System.out.println("DB_USERNAME: " + System.getenv("DB_USERNAME"));
		System.out.println("DB_MONGO_URI: " + System.getenv("DB_MONGO_URI"));
		System.out.println("======================================================\n\n");
		SpringApplication.run(StudygroupApplication.class, args);
	}

}
