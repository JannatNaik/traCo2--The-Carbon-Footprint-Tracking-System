<%@ page import="java.sql.*" %>
<%
    // Database connection details
    String url = "jdbc:mysql://localhost:3306/carbon_footprint_tracker";
    String user = "root";
    String password = "yourpassword";
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    
    // Assuming user is logged in and session contains user ID
    int uid = (session.getAttribute("uid") != null) ? (Integer) session.getAttribute("uid") : -1;
    if (uid == -1) {
        out.println("<p>User not logged in.</p>");
        return;
    }
    
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, user, password);
        
        // Fetch diet type from user_profile
        String query = "SELECT diet_type FROM user_profile WHERE uid = ?";
        ps = conn.prepareStatement(query);
        ps.setInt(1, uid);
        rs = ps.executeQuery();
        
        String dietType = "mixed"; // Default value
        if (rs.next()) {
            dietType = rs.getString("diet_type");
        }
        
        // Carbon emission factors (kg CO2 per day)
        double emissionFactor = 0;
        switch (dietType) {
            case "vegan": emissionFactor = 2.0; break;
            case "vegetarian": emissionFactor = 2.5; break;
            case "non-vegetarian": emissionFactor = 5.0; break;
            case "mixed": emissionFactor = 3.5; break;
        }
        
        // Calculate emissions for a month
        double monthlyEmissions = emissionFactor * 30;
        
        // Insert calculated emission into the carbon_emissions table
        String insertQuery = "INSERT INTO carbon_emissions (uid, timestamp, emission_value, emission_unit, source_type) VALUES (?, NOW(), ?, 'kg CO2', 'Diet')";
        ps = conn.prepareStatement(insertQuery);
        ps.setInt(1, uid);
        ps.setDouble(2, monthlyEmissions);
        ps.executeUpdate();
        
        out.println("<p>Diet-based carbon footprint: " + monthlyEmissions + " kg CO2 per month recorded successfully.</p>");
    } catch (Exception e) {
        out.println("Error: " + e.getMessage());
        e.printStackTrace();
    } finally {
        if (rs != null) rs.close();
        if (ps != null) ps.close();
        if (conn != null) conn.close();
    }
%>
