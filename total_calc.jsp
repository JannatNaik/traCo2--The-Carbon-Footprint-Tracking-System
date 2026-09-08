<%@ page import="java.sql.*, java.io.*, java.util.*" %>
<%
    // Database connection parameters
    String url = "jdbc:mysql://localhost:3306/carbon_footprint_tracker";
    String user = "root"; // Change as needed
    String password = ""; // Change as needed
    
    Connection conn = null;
    PreparedStatement pstmt = null;
    ResultSet rs = null;
    
    try {
        Class.forName("com.mysql.cj.jdbc.Driver");
        conn = DriverManager.getConnection(url, user, password);
        
        // Fetch user ID (Assuming session contains user ID)
        Integer uid = (Integer) session.getAttribute("user_id");
        if (uid == null) {
            out.println("User not logged in.");
            return;
        }

        // Retrieve total emissions from request parameters
        double totalEmissions = Double.parseDouble(request.getParameter("total_emissions"));
        String emissionUnit = "kg CO2"; // Standard unit
        String sourceType = "Total Emission Calculation";
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        // Insert total emission record into the database
        String insertQuery = "INSERT INTO carbon_emissions (uid, timestamp, emission_value, emission_unit, source_type) VALUES (?, ?, ?, ?, ?)";
        pstmt = conn.prepareStatement(insertQuery);
        pstmt.setInt(1, uid);
        pstmt.setTimestamp(2, timestamp);
        pstmt.setDouble(3, totalEmissions);
        pstmt.setString(4, emissionUnit);
        pstmt.setString(5, sourceType);
        
        int rowsInserted = pstmt.executeUpdate();
        
        if (rowsInserted > 0) {
            out.println("Total emissions recorded successfully!");
        } else {
            out.println("Failed to record emissions.");
        }
    } catch (Exception e) {
        e.printStackTrace();
        out.println("Error: " + e.getMessage());
    } finally {
        // Close resources
        if (pstmt != null) try { pstmt.close(); } catch (SQLException ignore) {}
        if (conn != null) try { conn.close(); } catch (SQLException ignore) {}
    }
%>
