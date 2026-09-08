<%@ page import="java.sql.*" %>
<%
    // Database connection details
    String url = "jdbc:mysql://localhost:3306/carbon_footprint_tracker";
    String dbUser = "root";
    String dbPassword = "password";
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    
    // User session (assuming user is logged in)
    int userId = (session.getAttribute("uid") != null) ? (int) session.getAttribute("uid") : -1;
    
    if (userId == -1) {
        out.println("<p>User not logged in.</p>");
        return;
    }
    
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, dbUser, dbPassword);
        
        // Fetch waste-related data from user_profile
        String fetchQuery = "SELECT waste_generated FROM user_profile WHERE uid = ?";
        pstmt = conn.prepareStatement(fetchQuery);
        pstmt.setInt(1, userId);
        rs = pstmt.executeQuery();
        
        double wasteGenerated = 0.0;
        if (rs.next()) {
            wasteGenerated = rs.getDouble("waste_generated");
        }
        
        // Approximate CO2 emission factor (kg CO2 per kg waste)
        double emissionFactor = 2.5; // Adjust as needed
        double emissionValue = wasteGenerated * emissionFactor;
        
        // Store result in emission table
        String insertQuery = "INSERT INTO carbon_emissions (uid, timestamp, emission_value, emission_unit, source_type) VALUES (?, NOW(), ?, 'kg CO2', 'Waste')";
        pstmt = conn.prepareStatement(insertQuery);
        pstmt.setInt(1, userId);
        pstmt.setDouble(2, emissionValue);
        pstmt.executeUpdate();
        
        out.println("<p>Carbon Emission from Waste: " + emissionValue + " kg CO2</p>");
    } catch (Exception e) {
        out.println("<p>Error: " + e.getMessage() + "</p>");
    } finally {
        try { if (rs != null) rs.close(); } catch (SQLException e) {}
        try { if (pstmt != null) pstmt.close(); } catch (SQLException e) {}
        try { if (conn != null) conn.close(); } catch (SQLException e) {}
    }
%>
s