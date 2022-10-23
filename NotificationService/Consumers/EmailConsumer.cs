using Core.Dtos;
using Infrastructure.Config;
using MailKit.Net.Smtp;
using MailKit.Security;
using MassTransit;
using Microsoft.Extensions.Options;
using MimeKit;

namespace NotificationService.Consumers
{
    public class EmailConsumer : IConsumer<MailDto>
    {
        
        private readonly TwitterCloneSmtpConfig _smtpConfig;
        public EmailConsumer( IOptions<TwitterCloneSmtpConfig>  smtpConfig)
        {
            _smtpConfig = smtpConfig.Value;
        }
        public async Task Consume(ConsumeContext<MailDto> context)
        {
            MailDto mailDto = context.Message;
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_smtpConfig.From));
            email.To.Add(MailboxAddress.Parse(mailDto.To));
            email.Subject = mailDto.Subject;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = mailDto.Body
            };
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpConfig.Host, _smtpConfig.Port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_smtpConfig.UserName, _smtpConfig.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}