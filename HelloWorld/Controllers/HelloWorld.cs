using Microsoft.AspNetCore.Mvc;

namespace HelloWorld.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HelloWorldController : ControllerBase
    {
        [HttpGet]
        public ActionResult<string> Get() => Ok("Hello World!");

        [HttpPost]
        public ActionResult<string> Post(string payload) => Ok(payload);
    }
}
