Build baseline Node application (minimal)

create bad dockerfile Dockerfile.bad

To build this docker you need to : 

     - docker build Dockerfile.bad -t lab3-api:bad
     - docker run --rm -p 8080:8080 lab3-api:bad  
 
After you build qnd run your docker image please verify: http://loalhost:8080/
