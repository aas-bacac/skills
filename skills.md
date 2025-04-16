# Skills astronomers need to transition outside of academia
For some skills on this list, we'll specifically call out the equivalent skills astronomers generally already know along with these skill's industry analogues.  We use "industry" here to mean positions/fields that are outside of academia like those in tech, industry, government, etc.
## Data Science
- A note on data science subdiscplines: we're using "data science" as an umbrella term for a spectrum of positions that includes
  - data analyst: data analysts generate reports and dashboards that inform high level business decisions. Data analysts are generally very familiar with SQL and building out metrics dashboards and conducting ad hoc reporting.
  - data scientist: data scientists do data anlystics and also add to that the ability to do sophisticated statistics and machine learning in order to inform high level business decisions. Frequently analysis is "offline", i.e. done in batch to produce reports or for e.g. email campaigns.
  - applied scientist: applied scientists are similar to data scientists, but have more of a focus on machine learning and "online" activities like search ranking, homefeed personalization, and fraud. This often involves writing code that is ran in backend machine learning microservices in production.  Applied scientists occasionally publish their research.
  - machine learning researcher: A focus on model tuning and new model development.  Frequently have PhDs in machine learning and publish their research.
  - machine learning engineer: A focus on the infrastructure surrounding machine learning: Can involve directly deploying model microservices and also working on the infrastructure and logic around these services like search indices, feature stores, etc.
  - Note the above subdisciplines all heavily overlap and are generally highly company-dependent.
- SQL
  - astronomy equivalent: Create a SDSS-based sample of galaxies based on X, Y, and Z criteria to study A. Translate this to a sql-query to extract data from the SDSS online database.
  - industry: Create a sample of customers based on X, Y, and Z criteria to study A. Translate this to a sql-query to extract data from your company's database.
- Metrics dashboards
  - astronomy equivalent: Derive measurable quantities that directly probe the physics of object class X.  Report out these quantities to the astro community and draw conclusions about X.
  - industry: Derive measurable quantities that directly probe the behavior of all customers or important subsets of customers.  Build a dashboard webpage that is automatically updated from your company's database to allow the company to make informed decision with real-time information.
- Machine Learning
  - evaluation: data splitting, metrics for classification, ranking, and regression.
  - [time series forecasting](https://en.wikipedia.org/wiki/Forecasting)
  - classical vs deep Learning
  - linear models
  - [tree-based models](https://en.wikipedia.org/wiki/Decision_tree_learning)
  - deep Learning's particular success for images, text, and audio
  - when to use deep learning vs classical machine learning
  - generative AI for images, text, and audio (approximate umbrella term: "LLMs")
     - familiarity with basic prompting techniques and evaluations
     - Understanding of pros and cons of prompted LLMs vs small fine-tuned models
  - astronomy equivalents: besides straightforward ML applied to science (e.g. [photometric redshift estimation](https://en.wikipedia.org/wiki/Photometric_redshift)), many astronomical analyses involve parameter estimation via something like curve-fitting, which can usually be re-cast as "machine learning" with appropriate caveats!
- [AB testing](https://en.wikipedia.org/wiki/A/B_testing)
  - pros and cons of AB testing vs simple metrics monitoring
  - basic AB testing statistics
    - p-values, t-test, etc
    - power analysis
    - [Seasonality](https://en.wikipedia.org/wiki/Seasonality) gotchas
- Software Engineering
  - Basic data structures and when to use them (lists, queues, stacks, hashmaps/dictionaries, trees).  The ability to solve simple problems using these data structures and reason about your solutions's time and space complexity (aka "leetcoding").
  - basic pros/cons and uses of compiled languages (e.g. c++, Java) vs interpreted languages (python). Be able to give a basic outline for why python has become so popular for machine learning and scientific computing.

## Other Field
- skill-1
- skill-2
