﻿using learnathon_learning_phase.Models;
using learnathon_learning_phase.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace learnathon_learning_phase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRegistrationController : ControllerBase
    {
        private readonly IUserService userService;
        public UserRegistrationController(IUserService userService)
        {
            this.userService = userService;
        }



        [HttpPost]
        public async Task<ActionResult> create(UserRegistrationDto userRegistrationDto)
        {
            var pass = this.CreatePasswordHash(userRegistrationDto.Password);
            var user = new UserModel
            {
                Username = userRegistrationDto.Username,
                Password = pass,
                Email = userRegistrationDto.Email,
                DateOfBirth = userRegistrationDto.DateOfBirth
            };
            userService.RegisterUser(user);

            return Ok("User registered");
        }




        private string CreatePasswordHash(string password)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));

                StringBuilder stringbuilder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    stringbuilder.Append(bytes[i].ToString("x2"));
                }
                return stringbuilder.ToString();
            }
        }

    }
}