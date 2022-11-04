using Core.Dtos;
using Infrastructure.Config;
using MailKit.Net.Smtp;
using MailKit.Security;
using MassTransit;
using Microsoft.Extensions.Options;
using MimeKit;

namespace NotificationService.Consumers;

public class EmailConsumer : IConsumer<MailDto>
{
    private IWebHostEnvironment _env;
    private readonly TwitterCloneSmtpConfig _smtpConfig;
    public EmailConsumer(IOptions<TwitterCloneSmtpConfig> smtpConfig, IWebHostEnvironment env)
    {
        _smtpConfig = smtpConfig.Value;
        _env = env;
    }
    public async Task Consume(ConsumeContext<MailDto> context)
    {
        MailDto mailDto = context.Message;


        var pathToFile = _env.WebRootPath
            + Path.DirectorySeparatorChar.ToString()
            + "Templates"
            + Path.DirectorySeparatorChar.ToString()
            + "EmailTemplates"
            + Path.DirectorySeparatorChar.ToString()
            + "ForgotPassword.html";

        var builder = new BodyBuilder();

        using (StreamReader SourceReader = System.IO.File.OpenText(pathToFile))
        {
            builder.HtmlBody = SourceReader.ReadToEnd().Replace("{0}",
                mailDto.User.FirstName).Replace("{1}", mailDto.User.LastName).Replace("{2}", mailDto.ResetPasswordUrl);
        }

        string messageBody = builder.HtmlBody;


        var email = new MimeMessage();

        email.From.Add(MailboxAddress.Parse(_smtpConfig.From));
        email.To.Add(MailboxAddress.Parse(mailDto.To));
        email.Subject = mailDto.Subject;
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
        {
            Text = messageBody
        };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_smtpConfig.Host, _smtpConfig.Port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_smtpConfig.UserName, _smtpConfig.Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}