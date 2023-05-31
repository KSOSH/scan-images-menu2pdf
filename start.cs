using System;
using System.Linq;
using System.Diagnostics;
using System.IO;

namespace Runner
{
    class Program
    {
        static void Main(string[] args)
        {
            String arguments = "index.js";
            Process p = new Process();
            p.StartInfo = new ProcessStartInfo("node.exe");
            p.StartInfo.Arguments = arguments;
            p.StartInfo.WorkingDirectory = Path.GetDirectoryName("node.exe");
            //p.StartInfo.CreateNoWindow = true;
            //p.StartInfo.UseShellExecute = false;
            p.Start();
        }
    }
}