import java.sql.*;
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;


public class DBServlet1 extends HttpServlet 
{

  
  protected void doPost(HttpServletRequest req, HttpServletResponse res)
    throws ServletException, IOException
	  {
	  try
	  {
		 dbConnect(req,res);
	  }
	  catch (Exception e)
	  {
		  System.out.println(e.getMessage());
	  }
    }
    
    protected void doGet(HttpServletRequest req,HttpServletResponse res) 
     throws IOException,ServletException 
	{ 
	  try
	  {
		 dbConnect(req,res);
	  }
	  catch (Exception e)
	  {
		  System.out.println(e.getMessage());
	  }
    }
    
   protected void dbConnect(HttpServletRequest req,HttpServletResponse res) 
     throws IOException,Exception 
	   {
			res.setContentType("text/plain");
			PrintWriter pw=res.getWriter();
		    Class.forName("sun.jdbc.odbc.JdbcOdbcDriver");

			Connection conn=DriverManager.getConnection("jdbc:odbc:SpectrumDB");
			Statement stm=conn.createStatement();
			String sub=req.getParameter("subject");
			         pw.println("<html>");
				 pw.println("<body>");
				 pw.println("<h1><b>U SELECTED</b></h1>");
				 pw.println("</body>");
				 pw.println("</html>");
			       
			   
			   stm.close();
			   conn.close();
			
	   }

}
