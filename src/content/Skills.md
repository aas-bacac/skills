# Skills astronomers may need to transition outside of academia
For some skills on this list, we'll specifically call out the equivalent skills astronomers generally already know along with these skills' industry analogues.  We use "industry" here to mean positions/fields that are outside of academia like those in tech, industry, government, etc.

## General
These skills are applicable to many disciplines.  In some cases you'll find these skills duplicated or expanded upon in other sections.
- teamwork, or technical communication and collaboration
  - collaborative software development
  - public speaking and presentations
  - technical writing and documentation
  - project management
  - astronomy equivalents: Working with large international collaborations on data reduction software, simulations, and hardware issues in order to scientific conclusions about how the universe works.
- Continuous learning
- mathematical modeling and statistics
- software development
- business acumen
  - big picture thinking
  - industry equivalent: bottom line business
  - astronomy equivalent: understanding what moves a scientific field forward.  e.g. Writing a NSF proposal.  How does the field/NSF think about telescope time. 
  - Placeholder for more edits!!!
  - Evaluate proposals/projects

## Data Science
- A note on data science subdisciplines: we're using "data science" as an umbrella term for a spectrum of subdisciplines.  These subdisciplines heavily overlap, and their definitions can vary significantly between companies.
  - data analyst: data analysts generate reports and dashboards that inform high-level business decisions. Data analysts are generally very familiar with SQL and building out metrics dashboards and conducting ad hoc reporting.
  - data scientist: Data scientists perform data analytics, sophisticated statistical analyses, and apply machine learning techniques. Frequently, analysis is "offline", i.e. done periodically in batch to produce reports or generate recommendations for e.g. email campaigns.
  - applied scientist: applied scientists are similar to data scientists, but have more of a focus on machine learning and "online" activities like search ranking, personalization, and fraud. This often involves writing code that is run in backend machine learning microservices in production.  Applied scientists occasionally publish their research.
  - machine learning researcher: A focus on novel uses of AI, often with a focus on data in the form of text, audio, images, and video.  Frequently have PhDs in machine learning and publish their research.
  - machine learning engineer: A focus on the infrastructure surrounding machine learning: Can involve directly deploying model microservices and also working on the infrastructure and logic around these services like search indices, feature stores, etc.
- SQL
  - astronomy equivalent: Create a SDSS-based sample of galaxies based on X, Y, and Z criteria to study A. Translate this to a sql-query to extract data from the SDSS online database.
  - industry: Create a sample of customers based on X, Y, and Z criteria to study A. Translate this to a sql-query to extract data from your company's database.
- Metrics dashboards
  - astronomy equivalent: Derive measurable quantities that probe the physics of object class X.  Report out these quantities to the astro community and draw conclusions about X.
  - industry: Derive measurable quantities about a subset X of customers.  Build a dashboard webpage that is automatically updated from your company's database to allow the company to make informed decision about X. Write a report about X and present to your colleagues.
- Machine Learning
  - evaluation: data splitting, [metrics for classification, ranking, and regression](https://en.wikipedia.org/wiki/Template:Machine_learning_evaluation_metrics).
  - [time series forecasting](https://en.wikipedia.org/wiki/Forecasting)
  - classical vs deep learning
  - linear models
  - [tree-based models](https://en.wikipedia.org/wiki/Decision_tree_learning)
  - deep learning's particular success for images, video, text, and audio
  - when to use deep learning vs classical machine learning
  - generative AI for images, text, and audio (umbrella terms: "LLMs" or "Generative AI")
     - familiarity with basic prompting techniques and evaluations
     - Understanding of pros and cons of prompted LLMs vs small fine-tuned models
  - astronomy equivalents: Straightforward ML applied to science (e.g. [ML-based photometric redshift estimation](https://en.wikipedia.org/wiki/Photometric_redshift)). Many astronomical analyses involve parameter estimation via something like curve-fitting, which can usually be re-cast as "machine learning" with appropriate caveats!  Astronomers' expertise in statistical bias is particularly relevant for thinking about machine learning datasets.  Example: Astronomers are good at guessing what the shortcomings of ML-based photometric redshift estimation are like lack of high-z training data, Malmquist bias, etc. This same skill applies to thinking about industry ML problems like fraud, recommendation, and search.
- [AB testing and statistics more generally](https://en.wikipedia.org/wiki/A/B_testing)
  - pros and cons of AB testing vs simple metrics monitoring
  - basic AB testing statistics
    - p-values, t-test, etc
    - power analysis
    - [Seasonality](https://en.wikipedia.org/wiki/Seasonality) gotchas
  - As discussed in the machine learning section, astronomers' expertise and intuition in statistical bias is particularly relevant here.
- Software Engineering (this section is particularly relevant for machine learning engineers)
  - Basic data structures and when to use them (lists, queues, stacks, hashmaps/dictionaries, trees).  The ability to solve simple problems using these data structures and reason about your solution's time and space complexity (aka "[leetcoding](https://en.wikipedia.org/wiki/LeetCode)").
  - basic pros/cons and uses of compiled languages (e.g. C++, Java) vs interpreted languages (Python). Be able to give a basic outline for why Python has become so popular for machine learning and scientific computing.

## Aerospace
- Common jobs for astronomers in aerospace: systems engineer, test engineer
- Communication
   - able to communicate complicated technical information to audiences that do not need to know the details but do need to understand the implications. This also includes the ability to summarize the technical details.
   - being able to modify your communication techniques to reach your audience – pictures & diagrams vs. stories; PowerPoint vs. verbal information; email vs. phone calls; etc.
- Teamwork: rarely are you an individual contributor, but rather part of a team that needs to work together
- Recommendation-making
   - based on the technical information, being able to make a recommendation for how best to proceed.
   - This not necessarily a skill learned in school, but becomes crucial in business contexts where schedule, budget, and the technical solution are all important to the ‘customer’.
- Decision-making: comfortable working in uncertainty and making decisions with limited information
- Software: Python, MATLAB
- Modeling Techniques: modeling to show relationships between measurables and desired quantities (this could be Monte Carlo model for statistics, Signal-to-Noise model, throughput model, or other optical system model, or other types of models to show relationships)
