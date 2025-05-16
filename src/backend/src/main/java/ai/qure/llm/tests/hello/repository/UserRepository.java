package ai.qure.llm.tests.hello.repository;

import ai.qure.llm.tests.hello.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByAadharNumber(String aadharNumber);
} 