package com.machrio.admin.repository;

import com.machrio.admin.entity.BankAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {
    List<BankAccount> findByActiveTrueOrderBySortOrderAscCountryAsc();
    List<BankAccount> findByCountryAndActiveTrueOrderBySortOrderAsc(String country);
    @Query("SELECT b FROM BankAccount b WHERE LOWER(b.bankName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.accountName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<BankAccount> searchByKeyword(String keyword, Pageable pageable);
}
