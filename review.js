
var reviews = [
    {
        company: "Google",
        job: "Software Engineer",
        salary: 120000,
        rating: 4,
        review: "Great company with amazing benefits.",
        date: "2025-03-15"
    },
    {
        company: "Microsoft",
        job: "Product Manager",
        salary: 110000,
        rating: 5,
        review: "Excellent work culture and good opportunities.",
        date: "2025-02-28"
    }
];

// Display existing reviews when page loads
$(document).ready(function() {
    displayReviews();
    $("#reviewForm").submit(function(event) {
        event.preventDefault();
        
        // Get form values
        var company = $("#company").val();
        var job = $("#job").val();
        var salary = $("#salary").val();
        var rating = $("#rating").val();
        var reviewText = $("#review").val();
        var date = new Date().toISOString().split('T')[0];
        
        // Create new review object
        var newReview = {
            company: company,
            job: job,
            salary: salary,
            rating: rating,
            review: reviewText,
            date: date
        };
        
        reviews.push(newReview);
        $("#reviewForm")[0].reset();
        displayReviews();
    });
});

function displayReviews() {
    $("#reviewsContainer").empty();
    $("#reviewsContainer").append("<h2>Recent Reviews</h2>");
    
    // Add each review to the page
    for (var i = 0; i < reviews.length; i++) {
        var review = reviews[i];
        
        var reviewHtml = `
            <div class="review">
                <h3>${review.company} - ${review.job}</h3>
                <p><strong>Rating:</strong> ${review.rating}/5</p>
                ${review.salary ? `<p><strong>Salary:</strong> $${review.salary}</p>` : ''}
                <p>${review.review}</p>
                <p><em>Posted on ${review.date}</em></p>
            </div>
        `;
        
        $("#reviewsContainer").append(reviewHtml);
    }
}