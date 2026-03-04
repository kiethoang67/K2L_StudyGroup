package com.lkl.studygroup.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String emailReceiver, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@studygroup.com");
        message.setTo(emailReceiver);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
