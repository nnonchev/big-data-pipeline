# Statistical and ML analysis

Sample of the dataset

| country | campus | grades      | absences | has_stopped | referer | hired_by  | has_pro_contract | alternative_choice |
| ------- | ------ | ----------- | -------- | ----------- | ------- | --------- | ---------------- | ------------------ |
| A       | a      | [2, 4, 1]   | 24       | yes         | friends | Company A | yes              | ULB                |
| B       | b      | [3, 8, 12]  | 10       | no          | website | null      | no               | VUB                |
| C       | a      | [2, 20, 18] | 45       | no          | fair    | Company B | yes              | null               |

<br />

1. ### Who are the most successful students, depending on the region/institution of origin?

   - To determine the significant difference of the grades per campus by country, we can use **Chi-squared test**;

   - To display the result to the clients we can use a **Grouped Bar Plot**;

   - Group all the students by Country, then by Campus and order by grades in descending order;

   - The first column is of the most succesfull student, and the last column is of the least succesful student;

   **NOTE**: We assume success is equivalent to the mean of all the grades of a student;

2. ### Who are the students who stop their studies and why?

   - We can use **Spearman correlation test** to determine how significant the grades, and absences fields are related to students stopping their studies.

   - To display the result to the clients we can use a **Scatter plot**.

3. ### Why there are more students in one region and few in another?

   - We can use a **Principal component analysis** to explain the most students in a country and why;

   - To display the result to the clinets we can use a **PCA biplot**;

4. ### How to revitalize campuses?

   - We can apply **Principal component analysis** to diminish the number of features, and determine which campuses have more students;

   - Use the PCA result, to determine what differences could be made to the campuses with less students, compared to the campuses with more students;

   **NOTE**: We assume that revitalizing campus means making more students apply;

   **NOTE**: In case the data is too big, combine **K-Means** with **Random Forest Regressor**;

5. ### What is the impact of a student fair on recruitments?

   - Group by campus and compare the number of students which have referer value _fair_, to the total amount of students in the campus;

6. ### What is the average length of time graduates are hired?

   - ???

7. ### Which companies recruit the most students from Supinfo?

   - Group by column _hired_by_, and order by total number of occurences in descending order;

   - The first column shows the company which hires the most students, and the last column shows the company which hires the least students;

   - To display the result to the clients we can use a **Pie Plot**;

8. ### Who are SUPINFO's competitors who are poaching our students?

   - Group by column _alternative_choice_, and order by total number of occurences in descending order;

   - The first column shows the competitor which poaches the most students, and the last column shows the competitor which poaches the least students;

   - To display the result to the clients we can use a **Pie Plot**;

9. ### Which regions have more Pro contracts and why?

   - Use **Binomial regression** to determine which components are most significant for a student to have a _has_pro_contract_, based on the column _country_status_ (e.g. developed, developing, under developed)

   - To display the result to the clients we can use a **Grouped Bar Plot**;

10. ### What are the school's growth forecasts?

- Use **Multivariate regression** based on number of contracts (dependant variable), and grades, absences, distance (independent variables), determine the growth of a university;

- To display the result to the clients we can use a **Scatter plot**;

- **NOTE**: Growth is based on number of contracts

- **NOTE**: Use the regression equation, to generate forecast

11. ### How to attract more students?
    - Use **Multi criteria evaluation**
