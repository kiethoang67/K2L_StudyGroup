package com.lkl.studygroup.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import sendinblue.ApiClient;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.CreateSmtpEmail;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmailService {

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    public void sendEmail(String emailReceiver, String subject, String body) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            System.err.println("BREVO_API_KEY is not set. Cannot send email.");
            return;
        }

        ApiClient defaultClient = Configuration.getDefaultApiClient();
        ApiKeyAuth apiKey = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
        apiKey.setApiKey(brevoApiKey);

        TransactionalEmailsApi apiInstance = new TransactionalEmailsApi();
        SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();

        SendSmtpEmailSender sender = new SendSmtpEmailSender();
        sender.setEmail("kiet.hoanganh.cit22@eiu.edu.vn");
        sender.setName("StudyGroup System");
        sendSmtpEmail.setSender(sender);

        List<SendSmtpEmailTo> toList = new ArrayList<>();
        SendSmtpEmailTo to = new SendSmtpEmailTo();
        to.setEmail(emailReceiver);
        toList.add(to);
        sendSmtpEmail.setTo(toList);

        sendSmtpEmail.setSubject(subject);
        sendSmtpEmail.setTextContent(body);

        try {
            CreateSmtpEmail result = apiInstance.sendTransacEmail(sendSmtpEmail);
            System.out.println("Email sent successfully via Brevo API: " + result.getMessageId());
        } catch (Exception e) {
            System.err.println("Exception when calling TransactionalEmailsApi#sendTransacEmail: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
